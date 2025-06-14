document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.querySelector('.todo-item ul');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const allFilter = document.getElementById('all');
    const assignedFilter = document.getElementById('assigned');
    const completedFilter = document.getElementById('completed');
    const allCount = document.getElementById('allCount');
    const assignedCount = document.getElementById('assignedCount');
    const completedCount = document.getElementById('completedCount');
    const taskForm = document.querySelector('.text');
    const taskInput = document.getElementById('task');
    const taskImageInput = document.getElementById('taskImage');

    let tasks = [];

    if (loadingSpinner) {
        loadingSpinner.style.display = 'block';
    }


    // Prevent default form submission and handle with JavaScript
    taskForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const taskText = taskInput.value.trim();
        if (!taskText) {
            alert('Task cannot be empty!');
            return;
        }

        const formData = new FormData();
        formData.append('task', taskText);

        if (taskImageInput && taskImageInput.files && taskImageInput.files.length > 0) {
            for (const file of taskImageInput.files) {
                formData.append('image', file);
            }
        }

        // Send request to backend
        fetch('http://localhost:3001/api/tasks/create', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        })
            .then(response => response.json())
            .then(newTask => {
                if (newTask.status === 'success' && newTask.task) {
                    tasks.push({
                        id: newTask.task.id,
                        task: newTask.task.task,
                        status: newTask.task.status,
                        image: Array.isArray(newTask.task.image) ? newTask.task.image : [newTask.task.image],
                    });
                    // Re-render task list
                    renderTasks('all');

                    // Clear input fields
                    taskInput.value = '';
                    taskImageInput.value = '';
                } else {
                    console.error('Error adding task:', newTask.message);
                }
            })
            .catch(error => console.error('Error:', error));
    });



    fetchTasks();
    // Function to fetch tasks
    function fetchTasks() {
        fetch('http://localhost:3001/api/tasks', {
            credentials: 'include',
        })
            .then(response => {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Unauthorized. Redirecting to login...');
                }
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(fetchedTasks => {
                if (fetchedTasks.status === 'success') {
                    tasks = fetchedTasks.data;
                    renderTasks('all');
                } else {
                    throw new Error('Failed to fetch tasks');
                }

                if (loadingSpinner) {
                    loadingSpinner.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error fetching tasks:', error.message);
                if (error.message.includes('Unauthorized')) {
                    window.location.href = '/login';
                }
            });
    }


    // Function to render tasks based on the selected filter
    function renderTasks(filter) {
        taskList.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            if (filter === 'all') return true;
            if (filter === 'assigned') return task.status === 'assigned';
            if (filter === 'completed') return task.status === 'completed';
        });

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.setAttribute('data-id', task.id);
            if (task.status === 'completed') {
                li.classList.add('completed');
            }


            let imageHTML = '';
            if (task.image && task.image.length > 0) {
                try {
                    const images = JSON.parse(task.image); // Parse JSON string if it's an array
                    if (Array.isArray(images) && images.length > 0) {
                        imageHTML = `<img src="http://localhost:3001/uploads/${images[0]}" class="task-image">`;
                    }
                } catch (error) {
                    console.error('Error parsing image data:', error);
                }
            }

            li.innerHTML = `
                        <span class="task-name">${task.task}</span>
            ${imageHTML}
                <i class="fas fa-check complete-btn"></i>
                <i class="fas fa-edit edit-btn"></i>
                <i class="fas fa-trash delete-btn"></i>
            `;
            taskList.appendChild(li);

            li.querySelector('.complete-btn').addEventListener('click', () => completeTask(task.id, li));
            li.querySelector('.edit-btn').addEventListener('click', () => editTask(task.id, li));
            li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id, li));
        });

        updateCounts();
        updateFilterHighlight(filter);
    }

    // Function to update task counts for filters
    function updateCounts() {
        allCount.textContent = tasks.length;
        assignedCount.textContent = tasks.filter(task => task.status === 'assigned').length;
        completedCount.textContent = tasks.filter(task => task.status === 'completed').length;
    }

    // Function to update active filter highlight
    function updateFilterHighlight(activeFilter) {
        [allFilter, assignedFilter, completedFilter].forEach(filter => {
            filter.classList.remove('active');
        });

        if (activeFilter === 'all') allFilter.classList.add('active');
        if (activeFilter === 'assigned') assignedFilter.classList.add('active');
        if (activeFilter === 'completed') completedFilter.classList.add('active');
    }

    allFilter.addEventListener('click', () => renderTasks('all'));
    assignedFilter.addEventListener('click', () => renderTasks('assigned'));
    completedFilter.addEventListener('click', () => renderTasks('completed'));

    // Function to edit a task
    function editTask(taskId, li) {
        const taskNameElement = li.querySelector('.task-name');
        const previousTaskName = taskNameElement.textContent;
        const newTaskName = prompt('Edit task name:', previousTaskName);

        if (!newTaskName || newTaskName.trim() === '') {
            alert('Task name cannot be empty or only spaces!');
            taskNameElement.textContent = previousTaskName; // Revert to the previous value
            return;
        }

        const trimmedTaskName = newTaskName.trim();
        taskNameElement.textContent = trimmedTaskName;

        fetch(`http://localhost:3001/api/edittask/${taskId}/edit`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task: newTaskName }),
        })
            .then(response => {
                if (response.status === 401) {
                    handleTokenRefresh(() => editTask(taskId, li)); // Retry after refreshing the token
                    throw new Error('Unauthorized');
                }
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(updatedTask => {
                console.log('Updated task from server:', updatedTask);
                const taskIndex = tasks.findIndex(task => task.id === taskId);
                if (taskIndex !== -1) tasks[taskIndex].task = newTaskName;
            })
            .catch(error => {
                console.error('Error updating task:', error);
            });
    }

    // Delete
    function deleteTask(taskId, li, isBatch = false) {
        if (!isBatch && !confirm('Are you sure you want to delete this task?')) {
            return;
        }

        if (li) {
            li.remove();
        }

        fetch(`http://localhost:3001/api/deletetask/${taskId}/delete`, {
            method: 'DELETE',
            credentials: 'include',
        })
            .then(response => {
                if (response.status === 401) {
                    handleTokenRefresh(() => deleteTask(taskId, li, isBatch));
                    throw new Error('Unauthorized');
                }
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(() => {
                console.log(`Task with ID ${taskId} deleted from database`);
                tasks = tasks.filter(task => task.id !== taskId);
                updateCounts();
            })
            .catch(error => console.error('Error deleting task:', error));
    }

    // Function to mark a task as completed
    function completeTask(taskId, li) {
        fetch(`http://localhost:3001/api/tasks/${taskId}/complete`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'completed' }),
        })
            .then(response => {
                if (response.status === 401) {
                    handleTokenRefresh(() => completeTask(taskId, li)); // Retry after refreshing the token
                    throw new Error('Unauthorized');
                }
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(updatedTask => {
                console.log('Task marked as completed:', updatedTask);
                li.classList.add('completed');
                const taskIndex = tasks.findIndex(task => task.id === taskId);
                if (taskIndex !== -1) tasks[taskIndex].status = 'completed';
                renderTasks('all'); // Re-render tasks
            })
            .catch(error => {
                console.error('Error marking task as completed:', error);
            });
    }

    // Refresh token logic
    let isRefreshing = false;

    async function handleTokenRefresh(callback) {
        if (isRefreshing) return; // Prevent multiple simultaneous refresh attempts

        isRefreshing = true;
        try {
            const response = await fetch('api/auth/refresh', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                console.log('Access token refreshed successfully');
                if (callback) callback();
            } else {
                console.error('Refresh token expired or invalid:', response.status);
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Error during token refresh:', error);
            window.location.href = '/login';
        } finally {
            isRefreshing = false;
        }
    }

    setTimeout(handleTokenRefresh, 3 * 60 * 60 * 1000);
    setInterval(handleTokenRefresh, 5 * 60 * 60 * 1000);
});

document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.querySelector('.todo-item ul');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const allFilter = document.getElementById('all');
    const completedFilter = document.getElementById('completed');
    const allCount = document.getElementById('allCount');
    const completedCount = document.getElementById('completedCount');


    let tasks = []; 

    if (loadingSpinner) {
        loadingSpinner.style.display = 'block';
    }

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
                tasks = fetchedTasks;
                renderTasks('all');

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
            return task.status === filter;
        });

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.setAttribute('data-id', task.id);
            if (task.status === 'completed') {
                li.classList.add('completed');
            }

            li.innerHTML = `
                <span class="task-name">${task.task}</span>
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
    }

    // Function to update task counts for filters
    function updateCounts() {
        allCount.textContent = tasks.length;
        completedCount.textContent = tasks.filter(task => task.status === 'completed').length;
    }

    allFilter.addEventListener('click', () => renderTasks('all'));
    completedFilter.addEventListener('click', () => renderTasks('completed'));


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
                updateCounts();
            })
            .catch(error => {
                console.error('Error marking task as completed:', error);
            });
    }

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

        fetch(`http://localhost:3001/api/tasks/${taskId}`, {
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

        fetch(`http://localhost:3001/api/tasks/${taskId}`, {
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

    let isRefreshing = false;

    async function handleTokenRefresh() {
        if (isRefreshing) return; // Prevent multiple simultaneous refresh attempts

        isRefreshing = true;
        try {
            const response = await fetch('/refresh', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                console.log('Access token refreshed successfully');
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

    setTimeout(handleTokenRefresh, 2 * 60 * 1000);
    setInterval(handleTokenRefresh, 50 * 1000);
});

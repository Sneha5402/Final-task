document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.querySelector('.todo-item ul');
    const loadingSpinner = document.querySelector('.loading-spinner');

    // Show spinner while loading
    if (loadingSpinner) {
        loadingSpinner.style.display = 'block';
    }

    fetchTasks();

    // Function to fetch tasks
    function fetchTasks() {
        fetch('http://localhost:3001/api/tasks', {
            credentials: 'include', // Include cookies for authentication
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
            .then(tasks => {
                // Hide spinner after fetching tasks
                if (loadingSpinner) {
                    loadingSpinner.style.display = 'none';
                }

                tasks.forEach(task => {
                    const li = document.createElement('li');
                    li.setAttribute('data-id', task.id);

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
            })
            .catch(error => {
                console.error('Error fetching tasks:', error.message);
                if (error.message.includes('Unauthorized')) {
                    window.location.href = '/login';
                }
            });
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
                })
                .catch(error => {
                    console.error('Error marking task as completed:', error);
                });
        }

    // Function to edit task
    function editTask(taskId, li) {
        const newTaskName = prompt('Edit task name:');
        if (newTaskName) {
            li.querySelector('.task-name').textContent = newTaskName;

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
                })
                .catch(error => {
                    console.error('Error updating task:', error);
                });
        }
    }

    // Function to delete task
    function deleteTask(taskId, li) {
        if (confirm('Are you sure you want to delete this task?')) {
            li.remove();

            fetch(`http://localhost:3001/api/tasks/${taskId}`, {
                method: 'DELETE',
                credentials: 'include',
            })
                .then(response => {
                    if (response.status === 401) {
                        handleTokenRefresh(() => deleteTask(taskId, li)); 
                        throw new Error('Unauthorized');
                    }
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(() => {
                    console.log('Task deleted from database');
                })
                .catch(error => console.error('Error deleting task:', error));
        }
    }
// Function to filter tasks based on their status
function filterTasks(status) {
    const allTasks = document.querySelectorAll('.todo-item ul li');

    // Iterate over all tasks and toggle visibility based on the status
    allTasks.forEach(task => {
        const isCompleted = task.classList.contains('completed');
        if ((status === 'pending' && isCompleted) || (status === 'completed' && !isCompleted)) {
            task.style.display = 'none'; // Hide tasks that don't match the filter
        } else {
            task.style.display = 'flex'; // Show tasks that match the filter
        }
    });
}

// Event listener for resetting filters (optional)
function showAllTasks() {
    const allTasks = document.querySelectorAll('.todo-item ul li');
    allTasks.forEach(task => (task.style.display = 'flex')); // Show all tasks
}

    

async function handleTokenRefresh() {
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
    }
}

setTimeout(handleTokenRefresh, 2 * 60 * 1000);
setInterval(handleTokenRefresh, 50 * 1000); 

  
});








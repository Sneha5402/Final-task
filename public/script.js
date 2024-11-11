document.addEventListener('DOMContentLoaded', () => {
    // Fetch tasks from the server
    fetch('http://localhost:3001/api/tasks')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(tasks => {
            const taskList = document.querySelector('.todo-item ul');
            tasks.forEach(task => {
                const li = document.createElement('li');
                li.setAttribute('data-id', task.id);  // Store task ID for future reference

                li.innerHTML = `
                    <span class="task-name">${task.task}</span>
                    <span class="task-status">${task.status}</span>
                    <i class="fas fa-edit edit-btn"></i>
                    <i class="fas fa-trash delete-btn"></i>
                    <i class="fas fa-check complete-btn"></i>
                `;

                taskList.appendChild(li);

                // Add event listener for editing task
                li.querySelector('.edit-btn').addEventListener('click', () => editTask(task.id, li));

                // Add event listener for deleting task
                li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id, li));

                // Add event listener for toggling status
                li.querySelector('.complete-btn').addEventListener('click', () => completeTask(task.id, li));

           
                

            });
        })
        .catch(error => {
            console.error('Error fetching tasks:', error.message);
        });
});

function editTask(taskId, li) {
    const newTaskName = prompt('Edit task name:');
    console.log('New Task Name:', newTaskName);  // Log to verify value

    if (newTaskName) {
        li.querySelector('.task-name').textContent = newTaskName;
        fetch(`http://localhost:3001/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({  task: (newTaskName)}) 
        })
        .then(response => {
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
        
    } else {
        console.error('New task name was not provided');
    }
}

// Function to delete task
function deleteTask(taskId, li) {
    if (confirm('Are you sure you want to delete this task?')) {
        // Remove from UI
        li.remove();

        // Delete from the database
        fetch(`http://localhost:3001/api/tasks/${taskId}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(() => {
                console.log('Task deleted from database');
            })
            .catch(error => console.error('Error deleting task:', error));
    }
}

// Function to complete a task and set other tasks to assigned
function completeTask(taskId) {
    const taskList = document.querySelectorAll('.todo-item ul li');
    taskList.forEach(li => {
        const liTaskId = li.getAttribute('data-id');
        const newStatus = (liTaskId === taskId.toString()) ? 'completed' : 'assigned';

        // Update in the UI
        li.querySelector('.task-status').textContent = newStatus;

        // Update in the database
        fetch(`http://localhost:3001/api/tasks/${liTaskId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        })
        .then(response => response.json())
        .then(updatedTask => {
            console.log('Task status updated in database:', updatedTask);
        })
        .catch(error => console.error('Error updating task status:', error));
    });
}

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
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                    <button class="status-btn">Toggle Status</button>
                `;

                taskList.appendChild(li);

                // Add event listener for editing task
                li.querySelector('.edit-btn').addEventListener('click', () => editTask(task.id, li));

                // Add event listener for deleting task
                li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id, li));

                // Add event listener for toggling status
                li.querySelector('.status-btn').addEventListener('click', () => toggleStatus(task.id, li));
            });
        })
        .catch(error => {
            console.error('Error fetching tasks:', error.message);
        });
});

function editTask(taskId, li) {
    const newTaskName = prompt('Edit task name:');
    if (newTaskName) {
        // Update in the UI
        li.querySelector('.task-name').textContent = newTaskName;

        // Update in the database
        fetch(`http://localhost:3001/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task: newTaskName })
        })
        .then(response => {
            console.log('Response status:', response.status);  // Log the response status
            return response.json();  // Parse the JSON response
        })
        .then(updatedTask => {
            console.log('Task updated in database:', updatedTask);
        })
        .catch(error => {
            console.error('Error updating task:', error);  // Log the error if any
            alert('Failed to update task');
        });
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

// Function to toggle task status
function toggleStatus(taskId, li) {
    const currentStatus = li.querySelector('.task-status').textContent;
    const newStatus = currentStatus === 'pending' ? 'assigned' : (currentStatus === 'assigned' ? 'completed' : 'pending');

    // Update in the UI
    li.querySelector('.task-status').textContent = newStatus;

    // Update in the database
    fetch(`http://localhost:3001/api/tasks/${taskId}/status`, {
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
}

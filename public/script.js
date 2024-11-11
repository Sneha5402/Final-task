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
                    <i class="fas fa-edit edit-btn"></i>
                    <i class="fas fa-trash delete-btn"></i>
                    
                `;

                taskList.appendChild(li);

                // Add event listener for editing task
                li.querySelector('.edit-btn').addEventListener('click', () => editTask(task.id, li));

                // Add event listener for deleting task
                li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id, li));


           
                

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




// Client-side logout function
const logout = async () => {
    try {
        // Get the refresh token from the cookies (assuming it's stored in a cookie)
        const refreshToken = document.cookie.split(';').find(cookie => cookie.includes('refreshToken'));

        if (!refreshToken) {
            console.log('No refresh token found');
            return;
        }

        // Send logout request to the server with the refresh token
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken })
        });

        const data = await response.json();
        console.log(data.message);

        // Clear the refresh token cookie and other session data
        document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');

        // Redirect to the login page after successful logout
        window.location.href = '/login';  // Redirect to login page

    } catch (error) {
        console.error('Error logging out:', error);
    }
};

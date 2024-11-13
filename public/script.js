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
                li.setAttribute('data-id', task.id);  

                li.innerHTML = `
                    <span class="task-name">${task.task}</span>
                    <i class="fas fa-edit edit-btn"></i>
                    <i class="fas fa-trash delete-btn"></i>
                `;
                taskList.appendChild(li);
                li.querySelector('.edit-btn').addEventListener('click', () => editTask(task.id, li));
                li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id, li));
            });
        })
        .catch(error => {
            console.error('Error fetching tasks:', error.message);
        });
});

function editTask(taskId, li) {
    const newTaskName = prompt('Edit task name:');
    console.log('New Task Name:', newTaskName);  

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
        li.remove();

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


const logout = async () => {
    try {
        // Retrieve the refresh token from cookies
        const cookies = document.cookie.split(';');
        const refreshTokenCookie = cookies.find(cookie => cookie.trim().startsWith('refreshToken='));

        // Check if the refresh token cookie is available
        if (!refreshTokenCookie) {
            console.log('No refresh token found');
            return;
        }

        // Extract the refresh token value from the cookie string
        const refreshToken = refreshTokenCookie.split('=')[1];

        if (!refreshToken) {
            console.log('Refresh token is empty');
            return;
        }

        console.log('Found refresh token:', refreshToken);  // Log to verify

        // Send the refresh token to the logout route
        const response = await fetch('http://localhost:3001/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken })  
        });

        const data = await response.json();
        console.log(data.message);  


        // Clear the refresh token cookie
      document.cookie = 'refreshToken=; path=/;'
      document.cookie = 'accessToken=; path=/;'

        // Redirect to login page
        window.location.href = '/login';

    } catch (error) {
        console.error('Error logging out:', error);
    }
};




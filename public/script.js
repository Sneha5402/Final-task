// Select elements
const inputText = document.querySelector("#txt");
const todoitem = document.querySelector(".todo-item ul");
const error = document.querySelector(".error");
const allFilter = document.querySelector("#all");
const assignedFilter = document.querySelector("#assigned");
const completedFilter = document.querySelector("#completed");
const clearBtn = document.querySelector(".clear-btn");
const noTasksMessage = document.querySelector(".no-tasks");

// Load tasks from local storage on page load
document.addEventListener("DOMContentLoaded", loadTasksFromLocalStorage);

// Add task function
function addtask() {
    if (inputText.value.trim() === '') {
        // Show error message
        displayErrorMessage("Oops! It seems that you didn't write anything in the field.");
    } else {
        // Show added successful message
        displaySuccessMessage("Task added successfully in your To-Do");

        // Create task object
        const task = {
            text: inputText.value,
            completed: false
        };

        // Save task to local storage
        saveTaskToLocalStorage(task);

        // Create task in DOM
        createTaskElement(task);

        // Clear input field
        inputText.value = '';

        // update the count
        updateCounts();
        setActiveFilter(allFilter);
        filterTasks("all");
    }
}

// Event listener to add task on Enter key press
inputText.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        addtask();
    }
});

// Function to display error messages
function displayErrorMessage(message) {
    error.style.visibility = 'visible';
    error.style.color = 'red';
    error.textContent = message;
    setTimeout(() => {
        error.style.visibility = 'hidden';
    }, 3000);
}

// Function to display success messages
function displaySuccessMessage(message) {
    error.style.visibility = 'visible';
    error.style.color = 'green';
    error.textContent = message;
    setTimeout(() => {
        error.style.visibility = 'hidden';
    }, 3000);
}

// Create task function
function createTaskElement(task) {
    let li = document.createElement("li");
    li.innerHTML = `<span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                    <div class="button">
                        <button class="complete-btn" type="button">
                            <i class="fas ${task.completed ? 'fa-check completed' : 'fa-check'}"></i>
                        </button>
                        <button class="edit" type="button">
                            <i class="far fa-edit"></i>
                        </button>
                        <button class="edit-btn" type="button">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>`;
    todoitem.appendChild(li);
    updateCounts();

    // Add event listeners for the new buttons
    li.querySelector('.complete-btn').addEventListener('click', updateTaskStatus);
    li.querySelector('.edit').addEventListener('click', editTask);
    li.querySelector('.edit-btn').addEventListener('click', deleteTask);

    // Apply the current filter to the new task
    applyCurrentFilter();
}

// Edit task function
function editTask(event) {
    const li = event.target.closest('li');
    const taskText = li.querySelector('.task-text');
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = taskText.textContent;
    taskText.replaceWith(inputField);

    // Helper function to save the edited task
    const saveEditedTask = () => {
        const newValue = inputField.value.trim();
        if (newValue === '') {
            displayErrorMessage("Task cannot be empty. Please enter a valid task.");
            inputField.replaceWith(taskText);
        } else {
            taskText.textContent = newValue;
            inputField.replaceWith(taskText);
            taskText.classList.add('edited');
            updateTaskInLocalStorage();
            updateCounts();
        }

        // Remove blur effect from other tasks
        const tasks = todoitem.querySelectorAll('li');
        tasks.forEach(task => {
            if (task !== li) {
                task.style.filter = 'none'; // Remove blur effect
            }
        });
    };
    

    // Blur other tasks when editing starts
    const tasks = todoitem.querySelectorAll('li');
    tasks.forEach(task => {
       
        if (task !== li) {
            task.style.filter = 'blur(3px)'; // Apply blur effect to other tasks
        }
    });

    inputField.addEventListener('blur', saveEditedTask);
    inputField.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            saveEditedTask();
        }
    });

    inputField.focus();
}


// Delete task function
function deleteTask(event) {
    const li = event.target.closest('li');
    li.remove();
    updateTaskInLocalStorage();
    updateCounts();
}

// Update task status
function updateTaskStatus(event) {
    const li = event.target.closest('li');
    const taskText = li.querySelector('.task-text');
    const completeBtn = li.querySelector('.complete-btn');
    const isCompleted = taskText.classList.toggle('completed');
    completeBtn.innerHTML = `<i class="fas ${isCompleted ? 'fa-check completed' : 'fa-check'}"></i>`;
    updateTaskInLocalStorage();
    updateCounts();

    // Apply the current filter to reflect the status change
    applyCurrentFilter();
}

// Clear all tasks function
clearBtn.addEventListener('click', confirmClearTasks);

// Function to confirm and clear tasks based on the current filter
function confirmClearTasks() {
    const confirmation = confirm("Are you sure you want to clear the tasks? This action cannot be undone.");
    if (confirmation) {
        clearTasks();
    }
}

// Function to clear tasks based on the current filter
function clearTasks() {
    const activeFilter = document.querySelector('.filter-active');
    const tasks = todoitem.querySelectorAll('li');
    tasks.forEach(task => {
        if (activeFilter === allFilter) {
            task.remove();
        } else if (activeFilter === assignedFilter && !task.querySelector('.task-text').classList.contains('completed')) {
            task.remove();
        } else if (activeFilter === completedFilter && task.querySelector('.task-text').classList.contains('completed')) {
            task.remove();
        }
    });

    // Update local storage and counts after clearing tasks
    updateTaskInLocalStorage();
    updateCounts();
}

// Filter tasks function
function filterTasks(filter) {
    const tasks = todoitem.querySelectorAll('li');
    tasks.forEach(task => {
        switch (filter) {
            case 'all':
                task.style.display = '';
                break;
            case 'assigned':
                task.style.display = task.querySelector('.task-text').classList.contains('completed') ? 'none' : '';
                break;
            case 'completed':
                task.style.display = task.querySelector('.task-text').classList.contains('completed') ? '' : 'none';
                break;
        }
    });
    updateCounts();
}


// Add event listeners for filters
allFilter.addEventListener('click', () => {
    filterTasks('all');
    setActiveFilter(allFilter);
});
assignedFilter.addEventListener('click', () => {
    filterTasks('assigned');
    setActiveFilter(assignedFilter);
});
completedFilter.addEventListener('click', () => {
    filterTasks('completed');
    setActiveFilter(completedFilter);
});

// Set active filter function
function setActiveFilter(activeFilter) {
    // Remove active class from all filters
    allFilter.classList.remove('filter-active');
    assignedFilter.classList.remove('filter-active');
    completedFilter.classList.remove('filter-active');

    // Add active class to the selected filter
    activeFilter.classList.add('filter-active');

    // Update count colors immediately
    updateCountColors();
}

// Function to update count colors based on active filter
function updateCountColors() {
    const allCount = document.getElementById('allCount');
    const assignedCount = document.getElementById('assignedCount');
    const completedCount = document.getElementById('completedCount');

    // Determine which filter is active
    if (allFilter.classList.contains('filter-active')) {
        allCount.style.color = '#297a46';
        assignedCount.style.color = '#333';
        completedCount.style.color = '#333';
    } else if (assignedFilter.classList.contains('filter-active')) {
        allCount.style.color = '#333';
        assignedCount.style.color = '#297a46';
        completedCount.style.color = '#333';
    } else if (completedFilter.classList.contains('filter-active')) {
        allCount.style.color = '#333';
        assignedCount.style.color = '#333';
        completedCount.style.color = '#297a46';
    }
}


// Count added for the filters
function updateCounts() {
    const tasks = todoitem.querySelectorAll('li');
    const totalCount = tasks.length;
    let assignedCount = 0;
    let completedCount = 0;

    tasks.forEach(task => {
        if (task.querySelector('.task-text').classList.contains('completed')) {
            completedCount++;
        } else {
            assignedCount++;
        }
    });

    const allCount = document.getElementById('allCount');
    const assignedCountElement = document.getElementById('assignedCount');
    const completedCountElement = document.getElementById('completedCount');

    allCount.textContent = totalCount;
    assignedCountElement.textContent = assignedCount;
    completedCountElement.textContent = completedCount;

    // Show task message
    if (totalCount === 0 && assignedCount === 0 && completedCount === 0) {
        noTasksMessage.style.display = 'block';
    } else {
        noTasksMessage.style.display = 'none';
    }

    // Change count color to green when active
    allCount.style.color = allFilter.classList.contains('filter-active') ? '#25b558' : '';
    assignedCountElement.style.color = assignedFilter.classList.contains('filter-active') ? '#25b558' : '';
    completedCountElement.style.color = completedFilter.classList.contains('filter-active') ? '#25b558' : '';
}

// Add task on button click
document.querySelector('.text-btn').addEventListener('click', addtask);

// Local storage functions
function saveTaskToLocalStorage(task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        createTaskElement(task);
    });
    updateCounts();
}


function updateTaskInLocalStorage() {
    const taskElements = todoitem.querySelectorAll('li');
    let tasks = [];
    taskElements.forEach(taskElement => {
        const task = {
            text: taskElement.querySelector('.task-text').textContent,
            completed: taskElement.querySelector('.task-text').classList.contains('completed')
        };
        tasks.push(task);
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Apply the current filter to the tasks
function applyCurrentFilter() {
    const activeFilter = document.querySelector('.filter-active');
    if (activeFilter === allFilter) {
        filterTasks('all');
    } else if (activeFilter === assignedFilter) {
        filterTasks('assigned');
    } else if (activeFilter === completedFilter) {
        filterTasks('completed');
    }
}

// Initial filter setup on page load
filterTasks('all');
setActiveFilter(allFilter);
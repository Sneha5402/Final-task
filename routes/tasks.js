const express = require('express');
const router = express.Router();
const  Task  = require('../models/task');

// In your Express app
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.findAll();  
        res.json(tasks);  
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Unable to fetch tasks' });
    }
});

// In your Express app
router.get('/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;  // Get the task ID from the request parameters
        const task = await Task.findOne({ where: { id: taskId } });  // Find the task by ID

        if (!task) {
            // If no task is found, return a 404 error
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(task);  // Return the task as JSON if found
    } catch (error) {
        console.error('Error fetching task by ID:', error);
        res.status(500).json({ error: 'Unable to fetch task' });  // Return error if something goes wrong
    }
});

// Your routes should come after the middleware
router.post('/tasks', async (req, res) => {
    try {
        const { task, status } = req.body;  // Extract task details from the request body

        if (!task || !status) {
            return res.status(400).json({ error: 'Task and status are required' });
        }

        const newTask = await Task.create({
            task,
            status
        });

        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Unable to create task', details: error.message });
    }
});



router.put('/api/tasks/:id', async (req, res) => {
    const taskId = req.params.id;
    try {
        const task = await Task.findByPk(taskId);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' }); // Return a proper error if task is not found
        }

        task.task = req.body.task;  // Update task name (or any other property)
        await task.save();

        res.json(task);  // Send updated task as response
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Unable to update task' });
    }
});

// Update task status
router.put('/api/tasks/:id/status', async (req, res) => {
    try {
        const taskId = req.params.id;
        const { status } = req.body;

        console.log('Updating task ID:', taskId, 'New status:', status);  // Log status update
        const updatedTask = await Task.update({ status }, {
            where: { id: taskId }
        });

        if (updatedTask[0] === 0) {
            console.log('Task not found with ID:', taskId);
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ id: taskId, status });
    } catch (error) {
        console.error('Error updating task status:', error);  // Log errors
        res.status(500).json({ error: 'Error updating task status' });
    }
});

// Delete task
router.delete('/api/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;

        console.log('Deleting task with ID:', taskId);  // Log delete attempt
        const deleted = await Task.destroy({
            where: { id: taskId }
        });

        if (deleted === 0) {
            console.log('Task not found with ID:', taskId);
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);  // Log errors
        res.status(500).json({ error: 'Error deleting task' });
    }
});


module.exports = router;

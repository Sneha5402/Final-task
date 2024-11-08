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

router.put('/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = req.body.task;  // Directly access req.body.task

        console.log('Request Params:', req.params);   // Confirm taskId
        console.log('Request Body:', req.body);       // Log the full body for troubleshooting
        console.log('Extracted Task Value:', task);   // Check extracted task value

        if (!task || typeof task !== 'string' || task.trim() === '') {
            return res.status(400).json({ error: 'Task name cannot be empty or invalid' });
        }

        const [updated] = await Task.update({ task }, { where: { id: taskId } });

        console.log('Update Result:', updated);  
        if (updated === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const updatedTask = await Task.findOne({ where: { id: taskId } });
        res.json(updatedTask);

    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Unable to update task' });
    }
});



// Route to delete a task
router.delete('/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;

        const deleted = await Task.destroy({ where: { id: taskId } });

        if (!deleted) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Unable to delete task' });
    }
});

module.exports = router;

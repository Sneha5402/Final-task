const express = require('express');
const router = express.Router();
const  Task  = require('../models/task');
const authenticateUser = require('../controllers/authenticateUser');

router.get('/tasks', authenticateUser, async (req, res) => {
    try {
        const userid = req.cookies.userid;

        if (!userid) {
            return res.status(401).json({
                status: "failure",
                message: "Unauthorized: No user ID found"
            });
        }
        else {
            const task = await Task.findAll({
                where: { userid: userid },
            });
            res.json({
                status: 'success',
                message: "Task created successfully",
                data: task
            });
        }
    } catch (error) {
        res.status(500).send('Error fetching tasks');
    }
});

router.get('/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await Task.findOne({ where: { id: taskId } });

        if (!task) {
            res.status(404).json({ error: 'Task not found' });
        } else {
            res.json(task);
        }
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch task' });
    }
});

// Edit the task
router.put('/edittask/:id/edit', async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = req.body.task;
 
        if (!task || typeof task !== 'string' || task.trim() === '') {
            res.status(400).json({ error: 'Task name cannot be empty or invalid' });
        }

        const [updated] = await Task.update({ task }, { where: { id: taskId } });
        console.log('Update Result:', updated);

        if (updated === 0) {
            res.status(404).json({ error: 'Task not found' });
        }
        else {
            const updatedTask = await Task.findOne({ where: { id: taskId } });
            res.json({
                success: true,
                message: 'Task updated successfully',
                taskId: taskId,
                updatedTask: updatedTask
            });
        }

    } catch (error) {
        res.status(500).json({ error: 'Unable to update task' });
    }
});

// Delete a specific task by ID
router.delete('/deletetask/:id/delete', async (req, res) => {
    try {
        const taskId = req.params.id;
        const deleted = await Task.destroy({ where: { id: taskId } });

        if (!deleted) {
            res.status(404).json({ error: 'Task not found' });
        } else {
            res.json({
                success: true,
                message: 'Task deleted successfully',
                taskId: taskId
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Unable to delete task' });
    }
});


// Complete a task
router.put('/tasks/:id/complete', async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await Task.findOne({ where: { id: taskId } });

        if (!task) {
            res.status(404).json({ error: 'Task not found' });
        } else {
            task.status = 'completed';
            await task.save();
            res.status(200).json({ message: 'Task marked as completed', task });
        }
    } catch (error) {
        console.error('Error completing task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

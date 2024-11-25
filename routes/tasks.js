const express = require('express');
const router = express.Router();
const  Task  = require('../models/task');
const checkAuth = require('../controllers/checkAuth');

router.get('/tasks', checkAuth, async (req, res) => {
    try {
        const userid =  req.cookies.userid;

        if (!userid) {
            return res.status(401).json({
                status: "failure",
                message: "Unauthorized: No user ID found"
            });
        }
        
        const task = await Task.findAll({
            where: { userid: userid },
        });

        res.json({
            status: 'success',
            message: "Task created successfully",
            data: task
          });
    } catch (error) {
        res.status(500).send('Error fetching tasks');
    }
});

router.get('/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;  
        const task = await Task.findOne({ where: { id: taskId } });  

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(task); 
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch task' });  
    }
});

// Edit the task
router.put('/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = req.body.task;  

        if (!task || typeof task !== 'string' || task.trim() === '') {
            return res.status(400).json({ error: 'Task name cannot be empty or invalid' });
        }

        const [updated] = await Task.update({ task }, { where: { id: taskId } });

        console.log('Update Result:', updated);  
        if (updated === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const updatedTask = await Task.findOne({ where: { id: taskId } });
        res.json({
            success: true,
            message: 'Task updated successfully',
            taskId: taskId,
            updatedTask: updatedTask
        });

    } catch (error) {
        res.status(500).json({ error: 'Unable to update task' });
    }
});

// Delete a specific task by ID
router.delete('/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const deleted = await Task.destroy({ where: { id: taskId } });

        if (!deleted) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({
            success: true,
            message: 'Task deleted successfully',
            taskId: taskId
        });
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
            return res.status(404).json({ error: 'Task not found' });
        }

        task.status = 'completed';
        await task.save();

        return res.status(200).json({ message: 'Task marked as completed', task });
    } catch (error) {
        console.error('Error completing task:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

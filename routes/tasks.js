const express = require('express');
const router = express.Router();
const  Task  = require('../models/task');
const checkAuth = require('../controllers/checkAuth');

router.get('/tasks', checkAuth, async (req, res) => {
    try {
        const userid =  req.cookies.userid;
        console.log('User ID:', req.cookies.userid);


        if (!userid) {
            return res.status(401).send('Unauthorized: No user ID found');
        }
        const task = await Task.findAll({
            where: { userid: userid },
        });

        res.json(task);
        console.log(task)
    } catch (error) {
        console.error('Error fetching tasks:', error);
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
        console.error('Error fetching task by ID:', error);
        res.status(500).json({ error: 'Unable to fetch task' });  
    }
});

router.put('/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = req.body.task;  

        console.log('Request Params:', req.params);   
        console.log('Request Body:', req.body);       
        console.log('Extracted Task Value:', task);   

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

// tasksController.js (in your backend)
const { Task } = require('../models');  // Sequelize model for tasks

// Create a new task
exports.createTask = async (req, res) => {
    try {
        const task = await Task.create({
            task: req.body.task,
            status: req.body.status || 'pending',
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Error creating task' });
    }
};

// Get all tasks
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.findAll();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching tasks' });
    }
};

// Update task status
exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        task.status = req.body.status;
        await task.save();
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Error updating task' });
    }
};

// Delete task
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        await task.destroy();
        res.status(200).json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting task' });
    }
};

const Task = require('../models/task');

const createTask = async (req, res) => {
    const { task, status } = req.body;

    if (!task) {
        return res.status(400).json({
            status: 'error',
            message: 'Task is required',
        });
    }

    try {
        const newTask = await Task.create({
            task,
            status,
            userid: req.userid,
        });
        console.log('Task created:', newTask);
        res.redirect('/todo');
    } catch (error) {
        res.status(500).send('Error creating task');
    }
};

const getTasks = async (req, res) => {
    try {
        const userid = req.cookies.userid;

        if (!userid) {
            return res.status(401).json({
                status: "failure",
                message: "Unauthorized: No user ID found"
            });
        } else {
            const tasks = await Task.findAll({ where: { userid: userid } });
            res.json({
                status: 'success',
                message: "Task fetched successfully",
                data: tasks
            });
        }
    } catch (error) {
        res.status(500).send('Error fetching tasks');
    }
};

const getTaskById = async (req, res) => {
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
};

const updateTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = req.body.task;

        if (!task || typeof task !== 'string' || task.trim() === '') {
            res.status(400).json({ error: 'Task name cannot be empty or invalid' });
        }

        const [updated] = await Task.update({ task }, { where: { id: taskId } });

        if (updated === 0) {
            res.status(404).json({ error: 'Task not found' });
        } else {
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
};

const deleteTask = async (req, res) => {
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
};

const completeTask = async (req, res) => {
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
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    completeTask
};

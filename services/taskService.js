const Task = require('../models/task');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// const uploadDir = path.join(__dirname, '../public/uploads');

// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

const createTask = async ({ task, status, userid, files }) => {
    if (!task) {
        logger.warn('Task creation failed: Task name is required');
        throw new Error('Task is required');
    }
    logger.info(`Creating task for user ID: ${userid}, Task: ${task}`);
    // const image = files.map(file => file.filename);
    const imageUrls = files.map(file => file.url); // Use S3 URLs
    // return await Task.create({ task, status, userid, image: JSON.stringify(image) });
    return await Task.create({ task, status, userid, image: JSON.stringify(imageUrls) });
};


const getTasks = async (userid) => {
    if (!userid) throw new Error("Unauthorized: No user ID found");
    return await Task.findAll({ where: { userid } });
};

const getTaskById = async (taskId) => {
    const task = await Task.findOne({ where: { id: taskId } });
    if (!task) throw new Error("Task not found");
    return task;
};
const fetchTaskImages = async (userid) => {
    if (!userid) throw new Error("Unauthorized: No user ID found");

    const tasks = await Task.findAll({
        where: { userid },
        attributes: ['image'],
    });
    return tasks.map(task => JSON.parse(task.image)).flat();
};


const updateTask = async (taskId, taskData) => {
    const { task } = taskData;
    if (!task || typeof task !== 'string' || task.trim() === '') {
        throw new Error("Task name cannot be empty");
    }
    const updated = await Task.update({ task }, { where: { id: taskId } });
    if (!updated) throw new Error("Task not found");
    return await Task.findOne({ where: { id: taskId } });
};

const deleteTask = async (taskId) => {
    const task = await Task.findOne({ where: { id: taskId } });
    if (!task) throw new Error("Task not found");
    // if (task.image) {
    //     const imagePath = path.join(__dirname, '../public/uploads', task.image);
    //     if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    // }
    await Task.destroy({ where: { id: taskId } });
};

const completeTask = async (taskId) => {
    const task = await Task.findOne({ where: { id: taskId } });
    if (!task) throw new Error("Task not found");
    task.status = 'completed';
    await task.save();
    return task;
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    completeTask,
    fetchTaskImages
};

const taskService = require('../services/taskService');
const logger = require('../utils/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../utils/s3Client');
const BUCKET_NAME = 'test';

const upload = multer({ storage: multer.memoryStorage() });

// const uploadDir = path.join(__dirname, '../public/uploads');

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, uploadDir),
//     filename: (req, file, cb) => {
//         const ext = path.extname(file.originalname);
//         cb(null, `task_img_${Date.now()}_${Math.random().toString(36)}${ext}`);
//     }
// });

// const upload = multer({ storage });


// const createTask = async (req, res) => {
//     try {
//         const newTask = await taskService.createTask({
//             task: req.body.task,
//             status: req.body.status,
//             userid: req.userid,
//             files: req.files
//         });
//         res.status(201).json({ status: 'success', message: 'Task created successfully', task: newTask });
//     } catch (error) {
//         logger.error(error.message);
//         res.status(400).json({ status: 'error', message: error.message });
//     }
// };
const createTask = async (req, res) => {
    try {
        const uploadedFiles = [];

        for (const file of req.files || []) {
            const ext = path.extname(file.originalname);
            const s3Key = `task_img_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;

            await s3.send(new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: s3Key,
                Body: file.buffer,
                ContentType: file.mimetype
            }));

            uploadedFiles.push({
                originalname: file.originalname,
                key: s3Key,
                url: `http://10.10.1.177:4566/${BUCKET_NAME}/${s3Key}`
            });
        }

        const newTask = await taskService.createTask({
            task: req.body.task,
            status: req.body.status,
            userid: req.userid,
            files: uploadedFiles
        });

        res.status(201).json({
            status: 'success',
            message: 'Task created and files uploaded to S3',
            task: newTask
        });
    } catch (error) {
        logger.error(error.message);
        res.status(400).json({ status: 'error', message: error.message });
    }
};


const getTasks = async (req, res) => {
    try {
        const tasks = await taskService.getTasks(req.cookies.userid);
        res.json({ status: 'success', message: "Tasks fetched successfully", data: tasks });
    } catch (error) {
        res.status(401).json({ status: 'failure', message: error.message });
    }
};

const getTaskById = async (req, res) => {
    try {
        const task = await taskService.getTaskById(req.params.id);
        res.json(task);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const getTaskImages = async (req, res) => {
    try {
        const { userid } = req.params;
        const images = await taskService.fetchTaskImages(userid);
        return res.json({ success: true, images });
    } catch (error) {
        console.error('Error fetching images:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateTask = async (req, res) => {
    try {
        const updatedTask = await taskService.updateTask(req.params.id, { task: req.body.task });
        res.json({ success: true, message: 'Task updated successfully', taskId: req.params.id, updatedTask });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        await taskService.deleteTask(req.params.id);
        res.json({ success: true, message: 'Task deleted successfully', taskId: req.params.id });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const completeTask = async (req, res) => {
    try {
        const task = await taskService.completeTask(req.params.id);
        res.status(200).json({ message: 'Task marked as completed', task });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    completeTask,
    getTaskImages ,
    upload
};

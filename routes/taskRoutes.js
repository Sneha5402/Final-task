const express = require('express');
const router = express.Router();

// Importing controller modules
const taskController = require('../controllers/taskController');
const authenticateUser = require('../controllers/authenticateUser');
const validateImages = require('../middleware/imageValidation');


router.post(
    '/tasks/create',
    authenticateUser,
    (req, res, next) => {
        taskController.upload.array('image')(req, res, (err) => {
            if (err) {
                return res.status(400).json({ error: "Invalid file upload. Ensure you're using 'image' as the key." });
            }
            next();
        });
    },
    validateImages,
    taskController.createTask
);
router.get('/tasks', authenticateUser, taskController.getTasks);
router.get('/tasks/:id', taskController.getTaskById);
router.get('/tasks/images/:userid', taskController.getTaskImages);

router.put('/edittask/:id/edit', taskController.updateTask);
router.delete('/deletetask/:id/delete', taskController.deleteTask);
router.put('/tasks/:id/complete', taskController.completeTask);

module.exports = router;

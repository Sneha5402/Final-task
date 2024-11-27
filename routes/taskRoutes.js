const express = require('express');
const router = express.Router();

// Importing controller modules
const taskController = require('../controllers/taskController');
const authenticateUser = require('../controllers/authenticateUser');

router.post('/tasks/create', authenticateUser, taskController.createTask);
router.get('/tasks', authenticateUser, taskController.getTasks);
router.get('/tasks/:id', taskController.getTaskById);
router.put('/edittask/:id/edit', taskController.updateTask);
router.delete('/deletetask/:id/delete', taskController.deleteTask);
router.put('/tasks/:id/complete', taskController.completeTask);

module.exports = router;

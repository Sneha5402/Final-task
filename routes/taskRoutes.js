const express = require('express');
const router = express.Router();
const { Tasks } = require('../models/task'); 

router.post('/tasks', async (req, res) => {
  const { task, status } = req.body;  
  try {
    // Create a new task in the database
    const newTask = await Tasks.create({
      task: task,
      status: status || 'pending',  
    });

    res.status(201).json({
      message: 'Task created successfully',
      task: newTask,
    });
  } catch (error) {
    console.error('Error:', error);  // Log full error details
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

module.exports = router;

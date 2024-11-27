const express = require('express');
const authController = require('../controllers/authcontroller'); 
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;

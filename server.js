// server.js
const express = require('express');
const path = require('path');
const sequelize = require('./config/db');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const { generateTokens } = require('./utils/tokens');
const Task = require('./models/task');
const tasksRouter = require('./routes/tasks');
const corsMiddleware = require('./cors');
const cookieParser = require('cookie-parser');
const authenticateUser = require('./controllers/authenticateUser');
const checkAuth = require('./controllers/checkAuth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json());
app.use(corsMiddleware);
app.use(cookieParser());
app.use('/api', tasksRouter);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});


// Signup 
app.post('/signup', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.send('Passwords do not match');
    }
    try {
        // Save user data to the database
        const newUser = await User.create({
            username,
            email: email,
            password,
        });
        console.log('User created:', newUser);
        res.redirect('/login');

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Error signing up');
    }
});

// Login
app.post('/login', async (req, res) => {

    console.log('Received body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }
    try {
        const user = await User.findOne({ where: { email, isDeleted: 0 } }); //soft delete

        if (!user) {
            return res.status(400).send('User not found or is soft-deleted');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).send('Invalid password');
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens();

        // Save refresh token in the database
        user.accessToken=accessToken;
        user.refreshToken = refreshToken;
        await user.save();

        // Set tokens as cookies
        res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 1 * 60 * 1000 }); 
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

        res.cookie('userid', user.userid, { httpOnly: true, });

        res.redirect('/todo');
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Error during login');
    }
});

app.post('/refresh', async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        console.log('No refresh token provided');
        return res.status(401).send('Refresh token is required');
    }

    try {
        const user = await User.findOne({ where: { refreshToken } });

        if (!user) {
            console.log('Invalid refresh token');
            return res.status(403).send('Invalid refresh token');
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens();

        // Update the refresh token in the database
        user.refreshToken = newRefreshToken;
        await user.save();

        // Set the new tokens as cookies
        res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 1 * 60 * 1000 });
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); 

        console.log('Tokens refreshed successfully');
        res.status(200).send('Token refreshed');
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).send('Error refreshing token');
    }
});


// ToDo page
app.get('/todo', checkAuth, async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'todo.html'));
});

app.post('/tasks/create', authenticateUser, async (req, res) => {
    const { task, status } = req.body;

    if (!task) {
        return res.status(400).send('Task is required');
    }
    try {
        const newTask = await Task.create({
            task,
            status,
            userid: req.userid,
        });
        console.log('Task created:', newTask);
        console.log('Creating task for user:', req.userid);
        res.redirect('/todo');
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).send('Error creating task');
    }
});
app.get('/api/tasks', checkAuth, async (req, res) => {
    try {
        const userid = req.query.userid || req.cookies.userid;

        if (!userid) {
            return res.status(401).send('Unauthorized: No user ID found');
        }
        const tasks = await Task.findAll({
            where: { userid: userid },
        });

        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).send('Error fetching tasks');
    }
});

// Logout
app.post('/logout', async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(400).send('Refresh token is required for logout');
    }

    try {
        // Find the user by refresh token
        const user = await User.findOne({ where: { refreshToken } });
        if (!user) {
            return res.status(403).send('Invalid refresh token');
        }

        // Remove the refresh token from the database
        user.refreshToken = null;
        user.accessToken=null;
        await user.save();

        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.redirect('/login');
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).send('Error during logout');
    }
});


// Soft delete route
app.post('/delete', checkAuth, async (req, res) => {
    try {
        const userId = req.userid;

        const user = await User.findOne({ where: { userid: userId } });

        if (!user) {
            return res.status(400).send('User not found');
        }

        user.isDeleted = true;
        await user.save();

        // Clear the cookies and log the user out after soft delete
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.clearCookie('userid');

        res.redirect('/login');
    } catch (error) {
        console.error('Error during soft delete:', error);
        res.status(500).send('Error during soft delete');
    }
});


// Database connection and server startup
sequelize.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

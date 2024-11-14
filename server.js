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
const checkAuth=require('./controllers/checkAuth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse incoming JSON data
app.use(express.json());
app.use(corsMiddleware);
app.use(cookieParser());


app.use('/api', tasksRouter);


// Middleware to parse URL-encoded data
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

app.post('/login', async (req, res) => {

    console.log('Received body:', req.body);
    const { email, password } = req.body;

       if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).send('User not found');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).send('Invalid password');
        }
        const { accessToken, refreshToken } = generateTokens(user);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('userid', user.userid, { httpOnly: true, });
        res.cookie('accessToken', accessToken, {httpOnly: true,});
        res.cookie('refreshToken', refreshToken, {httpOnly: true,});

        res.redirect('/todo');
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Error during login');
    }
});

app.get('/todo',checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'todo.html'));
});

app.post('/tasks/create', authenticateUser, async (req, res) => {
    const { task, status } = req.body;

    if (!task) {
        return res.status(400).send('Task is required');
    }

    try {
                // Check if the user is soft-deleted
                const user = await User.findOne({ where: { userid: req.userid, isDeleted: 0 } });

                if (!user) {
                    return res.status(400).send('User is soft-deleted or not found');
                }
        
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


app.post('/logout', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.redirect('/login');
    }

    try {
        const user = await User.findOne({ where: { refreshToken } });

        if (!user) {
            return res.status(400).send('User not found');
        }

        // Clear the refresh token in the database
        user.refreshToken = null;
        user.accessToken=null;
        await user.save();

        // Clear the cookies
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

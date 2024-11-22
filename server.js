// server.js
const express = require('express');
const path = require('path');
const sequelize = require('./config/db');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const { generateTokens } = require('./utils/tokens');
const Task = require('./models/task');
const tasksRouter = require('./routes/tasks');
const corsMiddleware = require('./cors/cors');
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
        return res.status(400).json({
            status: 'error',
            message: 'Passwords do not match',
        });
    }
    try {
        // Save user data to the database
        const newUser = await User.create({
            username,
            email: email,
            password,
        });
        console.log('User created:', newUser);
        res.status(201).json({
            status: 'success',
            message: 'User successfully registered',
            redirect: '/login'
        });

    } catch (error) {
        res.status(409).json({
            status: 'error',
            message: 'User already exists',
          });
    }
});

// Login
app.post('/login', async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            status: 'error',
            message: 'Email and password are required',
        });
    }
    
    try {
        const user = await User.findOne({ where: { email, isDeleted: 0 } }); 

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
              });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid password',
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens();

        // Set tokens as cookies
        res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 1 * 60 * 1000 }); 
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

        res.cookie('userid', user.userid, { httpOnly: true, });
          return res.status(200).json({
            status: 'success',
            message: 'Login successful',
            redirect: '/todo', 
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error during login, please try again later',
        });
    }
});

// Utility function to validate refresh tokens
const isValidRefreshToken = (token) => {
    try {
        return typeof token === 'string' && token.length > 0; 
    } catch (error) {
        console.error('Invalid refresh token:', error);
        return false;
    }
};
app.post('/refresh', (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(401).json({
            status: 'error',
            message: 'Refresh token is required',
            data: null
        });
    }
    
    try {
        if (!isValidRefreshToken(refreshToken)) {
            return res.status(403).json({
                status: 'error',
                message: 'Invalid refresh token',
                data: null
            });
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens();

        // Set the new tokens as cookies
        res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 1 * 60 * 1000 }); // 1 minute
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

        console.log('Tokens refreshed successfully');
        res.status(200).send('Token refreshed');
    }catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'An error occurred while processing the refresh token',
        });
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
        res.redirect('/todo');
    } catch (error) {
        res.status(500).send('Error creating task');
    }
});
// Logout Route
app.post('/logout', (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(400).send('Refresh token is required for logout');
    }

    // Clear both the access token and refresh token cookies
    res.clearCookie('accessToken', { httpOnly: true, });
    res.clearCookie('refreshToken', { httpOnly: true, });

    res.redirect('/login'); 
});



// Soft delete route
app.post('/delete', checkAuth, async (req, res) => {
    try {
        const userId = req.userid;

        const user = await User.findOne({ where: { userid: userId } });

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'User not found',
            });
        }

        user.isDeleted = true;
        await user.save();

        // Clear the cookies and log the user out after soft delete
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.clearCookie('userid');

        res.redirect('/login');
    } catch (error) {
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

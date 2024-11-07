// server.js
const express = require('express');
const path = require('path');
const sequelize = require('./config/db'); 
const bcrypt = require('bcryptjs'); 
const User = require('./models/user');
const authRoutes = require('./routes/authRoutes');
const { generateTokens } = require('./utils/tokens');
const Task = require('./models/task');
const tasksRouter = require('./routes/tasks');
// const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

app.use('/auth', authRoutes);
app.use('/api', tasksRouter);


// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
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
            password, // Store the hashed password
        });
        console.log('User created:', newUser);
        res.redirect('/login');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Error signing up');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(400).send('User not found');
        }

        // Compare entered password with stored password (you should hash password before storing)
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).send('Invalid password');
        }
        // Generate new access and refresh tokens
        const { accessToken, refreshToken } = generateTokens(user); 

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('accessToken', accessToken, {
            httpOnly: false, // Typically, we don't need to store access token in cookies
        });
        // Redirect the user to the todo page after successful login
        res.redirect('/todo');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Error during login');
    }
});



app.get('/todo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'todo.html'));
});


app.post('/tasks/create', async (req, res) => {
    const { task, status } = req.body;

    if (!task) {
        return res.send('Task is required');
    }

    try {
        const newTask = await Task.create({
            task,      
            status,      
        });
        console.log('Task created:', newTask);
        res.redirect('/todo');

    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).send('Error creating task');
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

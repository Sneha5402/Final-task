// server.js
const express = require('express');
const path = require('path');
const sequelize = require('./config/db'); 
const bcrypt = require('bcryptjs'); 
const User = require('./models/user');
const authRoutes = require('./routes/authRoutes');
const { generateTokens } = require('./utils/tokens');
const taskRoutes = require('./routes/taskRoutes');


const app = express();
const PORT = process.env.PORT || 3001;

app.use('/auth', authRoutes);


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
        res.send('Signup successful');
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

                // // Send both tokens in response
                // res.json({
                //     message: 'Login successful',
                //     accessToken: accessToken,  // Send access token to client
                //     refreshToken: refreshToken,  // Send refresh token in the response body
                // });

        // // Send tokens in response (store accessToken in a cookie, or handle on client-side)
        // res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
               
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



// Route to get all users
app.get('/users', async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Error fetching users');
    }
});



app.get('/todo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'todo.html'));
});


// Use the task routes
app.use('/api', taskRoutes);

// app.get('/api/tasks', (req, res) => {
//     const userId = req.session.userId;
  
//     if (!userId) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }
  
//     const userTasks = tasks.filter(task => task.userId === userId); // Filter tasks by userId
//     res.json(userTasks);
//   });
  

// app.post('/api/tasks', (req, res) => {
//     const { task } = req.body;
//     const userId = req.session.userId; // Assuming the user ID is stored in the session
  
//     if (!userId) {
//       return res.status(401).json({ error: 'Unauthorized' }); // If no user is logged in
//     }
  
//     if (task) {
//       const newTask = { task, userId, id: Date.now() }; // Add userId to the task
//       tasks.push(newTask); // Store the task in memory (you'd store this in a real database)
//       res.status(201).json(newTask); // Respond with the new task
//     } else {
//       res.status(400).json({ error: 'Task content is required' });
//     }
//   });
  

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

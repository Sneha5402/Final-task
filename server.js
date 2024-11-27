// server.js
const express = require('express');
const path = require('path');
const sequelize = require('./config/db');
const corsMiddleware = require('./cors/cors');
const cookieParser = require('cookie-parser');
const authenticateUser = require('./controllers/authenticateUser');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json());
app.use(corsMiddleware);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api', taskRoutes);

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

app.get('/todo', authenticateUser, async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'todo.html'));
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

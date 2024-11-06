// Task.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');  

const Task = sequelize.define('Tasks', {
    taskid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    task: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
    status: {
        type: DataTypes.ENUM('assigned', 'completed', 'pending'),
        allowNull: false,
        defaultValue: 'pending', 
    },
    createdBy: {
        type: DataTypes.INTEGER,  
        allowNull: true,
        references: {
            model: 'User',  
            key: 'userid'
        }
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true,  
    }
}, {
    timestamps: true,  
});

console.log(Task === sequelize.models.Task);

module.exports = Task;

console.log('Sequelize instance imported:', sequelize);

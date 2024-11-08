const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');  

const Task = sequelize.define('Tasks', {
    id: {
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

}, {
    timestamps: true,  
});

// async function alterTls.Task);

module.exports = Task;

console.log('Sequelize instance imported:', sequelize);

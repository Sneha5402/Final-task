// User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 
// const path = require('path');
// const sequelize = require(path.join(__dirname, '..', 'config', 'db'));


const User = sequelize.define('User', {
    userid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true, // Enables createdAt and updatedAt fields
});
console.log(User === sequelize.models.User);

module.exports = User;

console.log('Sequelize instance imported:', sequelize);

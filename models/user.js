const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');
const Task = require('./task');

const User = sequelize.define('Users', {
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
    accessToken: {
        type: DataTypes.STRING, 
        allowNull: true
    },
    refreshToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Default to false, indicating not deleted
    }
}, {
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10); // Hash the password before saving
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    },
});

// Define the one-to-many association
User.hasMany(Task, {
    foreignKey: 'userid',
});
  
Task.belongsTo(User, {
    foreignKey: 'userid',
});

console.log(User === sequelize.models.User);

module.exports = User;

console.log('Sequelize instance imported:', sequelize);

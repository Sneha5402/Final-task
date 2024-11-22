const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');  
const User = require('./user');

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
        type: DataTypes.ENUM('all', 'assigned', 'completed'),
        allowNull: false,
        defaultValue: 'assigned',
    },
    userid: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',  
        key: 'userid'
      },
    },

}, {
    timestamps: true,  
});




// async function alterTable() {
//   try {
//     await sequelize.sync({ force: true });
//     console.log("Table altered successfully.");
//   } catch (error) {
//     console.error("Error altering the table:", error);
//   }
// }
// alterTable();




module.exports = Task;



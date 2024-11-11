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

// async function alterTable() {
//   try {
//     await sequelize.sync({ alter: true });
//     console.log("Table altered successfully.");
//   } catch (error) {
//     console.error("Error altering the table:", error);
//   }
// }
// alterTable();



module.exports = Task;

console.log('Sequelize instance imported:', sequelize);

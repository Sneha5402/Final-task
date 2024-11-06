const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('todo', 'task', 'sneha', {
  host: 'localhost',
  dialect: 'mariadb', 
});


module.exports = sequelize;
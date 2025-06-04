const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('todo', 'task', 'sneha', {
  host: 'localhost',
  dialect: 'mariadb', 
  logging: false
});


module.exports = sequelize;
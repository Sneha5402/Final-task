'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tasks', 'image', {
      type: Sequelize.STRING,
      allowNull: true, // Set to true if the image is optional
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tasks', 'image');
  },
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'accessToken', {
      type: Sequelize.STRING,
      allowNull: true,  
    });
    
    await queryInterface.addColumn('Users', 'refreshToken', {
      type: Sequelize.STRING,
      allowNull: true,  
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Removing 'accessToken' and 'refreshToken' columns if the migration is rolled back
    await queryInterface.removeColumn('Users', 'accessToken');
    await queryInterface.removeColumn('Users', 'refreshToken');
  }
};

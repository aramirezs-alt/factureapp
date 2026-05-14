'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('usuari', 'reset_password_token', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('usuari', 'reset_password_expires', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('usuari', 'reset_password_token');
    await queryInterface.removeColumn('usuari', 'reset_password_expires');
  }
};

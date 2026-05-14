'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('despesa', 'periodicitat', {
      type: Sequelize.ENUM('CAP', 'MENSUAL', 'ANUAL'),
      defaultValue: 'CAP',
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('despesa', 'periodicitat');
  }
};

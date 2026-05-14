'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('perfil_negoci', 'serie_defecte', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'F2024',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('perfil_negoci', 'serie_defecte');
  }
};

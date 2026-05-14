'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('acces_assessor', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      usuari_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'usuari', key: 'id' },
        onDelete: 'CASCADE'
      },
      assessor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'usuari', key: 'id' },
        onDelete: 'CASCADE'
      },
      estat: { type: Sequelize.ENUM('PENDENT', 'ACTIU', 'REVOCAT'), defaultValue: 'ACTIU' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.addIndex('acces_assessor', ['usuari_id']);
    await queryInterface.addIndex('acces_assessor', ['assessor_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('acces_assessor');
  }
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notificacio', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      titol: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      missatge: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      llegida: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      usuari_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'usuari',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tipus: {
        type: Sequelize.ENUM('INFO', 'SUCCESS', 'WARNING', 'DANGER'),
        defaultValue: 'INFO',
      },
      link: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notificacio');
  }
};

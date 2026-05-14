const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdvisorAccess = sequelize.define('AdvisorAccess', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  usuari_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  assessor_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  estat: {
    type: DataTypes.ENUM('PENDENT', 'ACTIU', 'REVOCAT'),
    defaultValue: 'ACTIU',
  }
}, {
  tableName: 'acces_assessor',
  timestamps: true,
  underscored: true,
});

module.exports = AdvisorAccess;

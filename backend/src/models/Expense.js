const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  descripcio: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  import_net: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  import_iva: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  tipus_iva: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  adjunt_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  data_despesa: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  usuari_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  proveidor_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  periodicitat: {
    type: DataTypes.ENUM('CAP', 'MENSUAL', 'ANUAL'),
    defaultValue: 'CAP',
  },
  ultima_generacio: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'despesa',
  timestamps: true, underscored: true,
  indexes: [
    { fields: ['usuari_id'] },
    { fields: ['proveidor_id'] },
  ],
});

module.exports = Expense;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InvoiceLine = sequelize.define('InvoiceLine', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  descripcio: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantitat: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 1,
  },
  preu_unitari: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  tipus_iva: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  import_iva: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total_linia: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  factura_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  producte_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: 'linia_factura',
  timestamps: true, underscored: true,
  indexes: [
    { fields: ['factura_id'] },
    { fields: ['producte_id'] },
  ],
});

module.exports = InvoiceLine;

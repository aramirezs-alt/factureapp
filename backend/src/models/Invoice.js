const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  numero_Factura: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'numero_Factura',
  },
  serie: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  data_emissio: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  data_venciment: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  estat: {
    type: DataTypes.ENUM('ESBORRANY', 'ENVIADA', 'PAGADA', 'VENÇUDA', 'CANCEL·LADA'),
    defaultValue: 'ESBORRANY',
  },
  base_imposable: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total_iva: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  tipus_irpf: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  total_irpf: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  client_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  usuari_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'factura',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['client_id'] },
    { fields: ['usuari_id'] },
    {
      fields: ['usuari_id', 'serie', 'numero_Factura'],
      unique: true,
      name: 'unique_invoice_number_per_serie_user'
    }
  ],
});

module.exports = Invoice;

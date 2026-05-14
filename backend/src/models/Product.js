const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  preu_unitari: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  tipus_iva: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  usuari_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'producte',
  timestamps: true, underscored: true,
  indexes: [
    { fields: ['usuari_id'] },
  ],
});

module.exports = Product;

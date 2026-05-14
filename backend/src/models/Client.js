const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nif: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefon: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pais: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  adreca: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  codi_postal: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ciutat: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  usuari_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'client',
  timestamps: true, underscored: true,
  indexes: [
    {
      fields: ['usuari_id'],
    },
    {
      fields: ['usuari_id', 'nif'],
      unique: true,
      name: 'unique_nif_per_user'
    }
  ],
});

module.exports = Client;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BusinessProfile = sequelize.define('BusinessProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cognoms: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  nom_negoci: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  nif_cif: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  telefon: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pais: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  adreca: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ciutat: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  codi_postal: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  logo_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  iva_defecte: {
    type: DataTypes.FLOAT,
    defaultValue: 21.0,
    field: 'iva_defecte',
  },
  irpf_defecte: {
    type: DataTypes.FLOAT,
    defaultValue: 15.0,
    field: 'irpf_defecte',
  },
  serie_defecte: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'F2024',
  },
  usuari_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'perfil_negoci',
  timestamps: true, underscored: true,
});

module.exports = BusinessProfile;

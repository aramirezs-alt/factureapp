const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  titol: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  missatge: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  llegida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  usuari_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  tipus: {
    type: DataTypes.ENUM('INFO', 'SUCCESS', 'WARNING', 'DANGER'),
    defaultValue: 'INFO',
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'notificacio',
  timestamps: true,
  underscored: true,
});

module.exports = Notification;

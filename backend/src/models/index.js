const sequelize = require('../config/database');
const User = require('./User');
const BusinessProfile = require('./BusinessProfile');
const Client = require('./Client');
const Invoice = require('./Invoice');
const InvoiceLine = require('./InvoiceLine');
const Product = require('./Product');
const Provider = require('./Provider');
const Expense = require('./Expense');
const AdvisorAccess = require('./AdvisorAccess');
const Notification = require('./Notification');

// RELATIONS

// USUARI (1) —TE→ PERFIL_NEGOCI (1)
User.hasOne(BusinessProfile, { foreignKey: 'usuari_id', onDelete: 'CASCADE' });
BusinessProfile.belongsTo(User, { foreignKey: 'usuari_id' });

// USUARI (1) —REP→ CLIENT (N)
User.hasMany(Client, { foreignKey: 'usuari_id', onDelete: 'CASCADE' });
Client.belongsTo(User, { foreignKey: 'usuari_id' });

// USUARI (1) —EMET→ FACTURA (N)
User.hasMany(Invoice, { foreignKey: 'usuari_id', onDelete: 'CASCADE' });
Invoice.belongsTo(User, { foreignKey: 'usuari_id' });

// CLIENT (1) —REP→ FACTURA (N)
Client.hasMany(Invoice, { foreignKey: 'client_id' });
Invoice.belongsTo(Client, { foreignKey: 'client_id' });

// FACTURA (1) —CONTE→ LINIA_FACTURA (N)
Invoice.hasMany(InvoiceLine, { foreignKey: 'factura_id', onDelete: 'CASCADE' });
InvoiceLine.belongsTo(Invoice, { foreignKey: 'factura_id' });

// PRODUCTE (1) —APAREEIX→ LINIA_FACTURA (N)
Product.hasMany(InvoiceLine, { foreignKey: 'producte_id' });
InvoiceLine.belongsTo(Product, { foreignKey: 'producte_id' });

// USUARI (1) —TE→ PRODUCTE (N)
User.hasMany(Product, { foreignKey: 'usuari_id', onDelete: 'CASCADE' });
Product.belongsTo(User, { foreignKey: 'usuari_id' });

// USUARI (1) —TE→ PROVEIDOR (N)
User.hasMany(Provider, { foreignKey: 'usuari_id', onDelete: 'CASCADE' });
Provider.belongsTo(User, { foreignKey: 'usuari_id' });

// USUARI (1) —REGISTRA→ DESPESA (N)
User.hasMany(Expense, { foreignKey: 'usuari_id', onDelete: 'CASCADE' });
Expense.belongsTo(User, { foreignKey: 'usuari_id' });

// PROVEIDOR (1) —INCLOU→ DESPESA (N)
Provider.hasMany(Expense, { foreignKey: 'proveidor_id' });
Expense.belongsTo(Provider, { foreignKey: 'proveidor_id' });

// ACCES ASSESSOR — relació N:M entre usuaris i assessors
User.hasMany(AdvisorAccess, { foreignKey: 'usuari_id', as: 'assessorsAtorgats' });
User.hasMany(AdvisorAccess, { foreignKey: 'assessor_id', as: 'clientsAssessorats' });
AdvisorAccess.belongsTo(User, { foreignKey: 'usuari_id', as: 'Usuari' });
AdvisorAccess.belongsTo(User, { foreignKey: 'assessor_id', as: 'Assessor' });

// USUARI (1) —REP→ NOTIFICACIO (N)
User.hasMany(Notification, { foreignKey: 'usuari_id', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'usuari_id' });

module.exports = {
  User,
  BusinessProfile,
  Client,
  Invoice,
  InvoiceLine,
  Product,
  Provider,
  Expense,
  AdvisorAccess,
  Notification,
  sequelize,
};

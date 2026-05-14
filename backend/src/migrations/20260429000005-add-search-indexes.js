'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Activar l'extensió per a cerques de text aproximades (trigram)
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
    
    // 2. Crear índexs GIN per accelerar cerques amb LIKE '%...%'
    
    // Factures: numero_Factura, serie
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS invoice_numero_trgm_idx ON factura USING gin ("numero_Factura" gin_trgm_ops);');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS invoice_serie_trgm_idx ON factura USING gin (serie gin_trgm_ops);');
    
    // Despeses: descripcio
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS expense_desc_trgm_idx ON despesa USING gin (descripcio gin_trgm_ops);');
    
    // Clients: nom
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS client_nom_trgm_idx ON client USING gin (nom gin_trgm_ops);');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS invoice_numero_trgm_idx;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS invoice_serie_trgm_idx;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS expense_desc_trgm_idx;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS client_nom_trgm_idx;');
  }
};

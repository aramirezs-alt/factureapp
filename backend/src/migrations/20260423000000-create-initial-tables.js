'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. USUARI
    await queryInterface.createTable('usuari', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      rol: { type: Sequelize.ENUM('ADMIN', 'USER', 'ASSESSOR'), defaultValue: 'USER' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 2. PERFIL_NEGOCI
    await queryInterface.createTable('perfil_negoci', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      nom: { type: Sequelize.STRING, allowNull: true },
      cognoms: { type: Sequelize.STRING, allowNull: true },
      nom_negoci: { type: Sequelize.STRING, allowNull: true },
      nif_cif: { type: Sequelize.STRING, allowNull: true },
      telefon: { type: Sequelize.STRING, allowNull: true },
      pais: { type: Sequelize.STRING, allowNull: true },
      adreca: { type: Sequelize.STRING, allowNull: true },
      ciutat: { type: Sequelize.STRING, allowNull: true },
      codi_postal: { type: Sequelize.STRING, allowNull: true },
      logo_url: { type: Sequelize.STRING, allowNull: true },
      iva_defecte: { type: Sequelize.DECIMAL(10, 2), defaultValue: 21.0 },
      usuari_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'usuari', key: 'id' },
        onDelete: 'CASCADE'
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 3. CLIENT
    await queryInterface.createTable('client', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      nom: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false },
      nif: { type: Sequelize.STRING, allowNull: false },
      telefon: { type: Sequelize.STRING, allowNull: false },
      pais: { type: Sequelize.STRING, allowNull: false },
      adreca: { type: Sequelize.STRING, allowNull: false },
      codi_postal: { type: Sequelize.STRING, allowNull: false },
      ciutat: { type: Sequelize.STRING, allowNull: false },
      usuari_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'usuari', key: 'id' },
        onDelete: 'CASCADE'
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 4. PRODUCTE
    await queryInterface.createTable('producte', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      nom: { type: Sequelize.STRING, allowNull: false },
      descripcio: { type: Sequelize.TEXT, allowNull: true },
      preu_unitari: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      tipus_iva: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      usuari_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'usuari', key: 'id' },
        onDelete: 'CASCADE'
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 5. FACTURA
    await queryInterface.createTable('factura', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      numero_Factura: { type: Sequelize.STRING, allowNull: false },
      serie: { type: Sequelize.STRING, allowNull: false },
      data_emissio: { type: Sequelize.DATE, allowNull: false },
      data_venciment: { type: Sequelize.DATE, allowNull: false },
      estat: { type: Sequelize.ENUM('ESBORRANY', 'ENVIADA', 'PAGADA', 'VENÇUDA', 'CANCEL·LADA'), defaultValue: 'ESBORRANY' },
      base_imposable: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      total_iva: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      notes: { type: Sequelize.TEXT, allowNull: true },
      client_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'client', key: 'id' },
        onDelete: 'RESTRICT'
      },
      usuari_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'usuari', key: 'id' },
        onDelete: 'CASCADE'
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 6. LINIA_FACTURA
    await queryInterface.createTable('linia_factura', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      descripcio: { type: Sequelize.STRING, allowNull: false },
      quantitat: { type: Sequelize.DECIMAL(10, 2), defaultValue: 1 },
      preu_unitari: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      tipus_iva: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      import_iva: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      subtotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      total_linia: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      factura_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'factura', key: 'id' },
        onDelete: 'CASCADE'
      },
      producte_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'producte', key: 'id' },
        onDelete: 'SET NULL'
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 7. PROVEIDOR
    await queryInterface.createTable('proveidor', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      nom: { type: Sequelize.STRING, allowNull: false },
      nif: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false },
      telefon: { type: Sequelize.STRING, allowNull: false },
      adreca: { type: Sequelize.STRING, allowNull: false },
      categoria: { type: Sequelize.STRING, allowNull: false },
      usuari_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'usuari', key: 'id' },
        onDelete: 'CASCADE'
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 8. DESPESA
    await queryInterface.createTable('despesa', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      descripcio: { type: Sequelize.STRING, allowNull: false },
      categoria: { type: Sequelize.STRING, allowNull: false },
      import_net: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      import_iva: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      tipus_iva: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      adjunt_url: { type: Sequelize.STRING, allowNull: true },
      data_despesa: { type: Sequelize.DATE, allowNull: false },
      usuari_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'usuari', key: 'id' },
        onDelete: 'CASCADE'
      },
      proveidor_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'proveidor', key: 'id' },
        onDelete: 'SET NULL'
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // Indexes on foreign keys
    await queryInterface.addIndex('client', ['usuari_id']);
    await queryInterface.addIndex('perfil_negoci', ['usuari_id']);
    await queryInterface.addIndex('factura', ['client_id']);
    await queryInterface.addIndex('factura', ['usuari_id']);
    await queryInterface.addIndex('linia_factura', ['factura_id']);
    await queryInterface.addIndex('linia_factura', ['producte_id']);
    await queryInterface.addIndex('producte', ['usuari_id']);
    await queryInterface.addIndex('proveidor', ['usuari_id']);
    await queryInterface.addIndex('despesa', ['usuari_id']);
    await queryInterface.addIndex('despesa', ['proveidor_id']);
    
    // Unique constraints
    await queryInterface.addIndex('client', ['usuari_id', 'nif'], {
      unique: true,
      name: 'unique_nif_per_user'
    });
    await queryInterface.addIndex('proveidor', ['usuari_id', 'nif'], {
      unique: true,
      name: 'unique_provider_nif_per_user'
    });
    await queryInterface.addIndex('factura', ['usuari_id', 'serie', 'numero_Factura'], {
      unique: true,
      name: 'unique_invoice_number_per_serie_user'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('despesa');
    await queryInterface.dropTable('proveidor');
    await queryInterface.dropTable('linia_factura');
    await queryInterface.dropTable('factura');
    await queryInterface.dropTable('producte');
    await queryInterface.dropTable('client');
    await queryInterface.dropTable('perfil_negoci');
    await queryInterface.dropTable('usuari');
  }
};

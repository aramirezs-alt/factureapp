const bcrypt = require('bcryptjs');
const { User, BusinessProfile, Client, Provider, Product, Invoice, InvoiceLine, Expense, sequelize } = require('../models');

async function resetAndSeed() {
  try {
    console.log('⚠️ Starting database reset (force sync)...');
    
    // This will drop all tables and recreate them
    await sequelize.sync({ force: true });
    console.log('✅ Database cleared and tables recreated.');

    const transaction = await sequelize.transaction();
    try {
      console.log('🌱 Starting seed process...');

      // 1. Create Main User
      const passwordHash = await bcrypt.hash('admin123', 10);
      const user = await User.create({
        email: 'admin@factures.cat',
        password_hash: passwordHash,
        rol: 'USER'
      }, { transaction });

      // 2. Create Business Profile
      await BusinessProfile.create({
        nom: 'Adrià',
        cognoms: 'Ramírez',
        nom_negoci: 'TronDisc Solucions Digitals',
        nif_cif: '12345678Z',
        telefon: '600000000',
        pais: 'Espanya',
        adreca: 'Carrer de la Tecnologia, 42',
        ciutat: 'Barcelona',
        codi_postal: '08001',
        iva_defecte: 21.0,
        serie_defecte: '2026',
        usuari_id: user.id
      }, { transaction });

      // 3. Create Clients
      const clientsData = [
        { 
          nom: 'Empresa Examen SL', 
          email: 'facturacio@examen.com', 
          nif: 'B99887766', 
          telefon: '933445566',
          pais: 'Espanya',
          codi_postal: '08028',
          ciutat: 'Barcelona', 
          adreca: 'Diagonal 123', 
          usuari_id: user.id 
        },
        { 
          nom: 'Tech Innovators S.L.', 
          email: 'contact@tech.com', 
          nif: 'B98765432', 
          telefon: '972123456',
          pais: 'Espanya',
          codi_postal: '17001',
          ciutat: 'Girona', 
          adreca: 'Carrer Major 5', 
          usuari_id: user.id 
        },
        { 
          nom: 'Consultoría Balmes', 
          email: 'info@balmes.es', 
          nif: 'B66554433', 
          telefon: '934567890',
          pais: 'Espanya',
          codi_postal: '08008',
          ciutat: 'Barcelona', 
          adreca: 'Carrer Balmes 120', 
          usuari_id: user.id 
        }
      ];
      
      const clients = await Promise.all(clientsData.map(c => Client.create(c, { transaction })));

      // 4. Create Providers
      const providersData = [
        { 
          nom: 'Amazon Web Services', 
          nif: 'W1234567A', 
          email: 'billing@aws.com', 
          telefon: '900000001',
          adreca: 'Online',
          categoria: 'Software', 
          usuari_id: user.id 
        },
        { 
          nom: 'Endesa', 
          nif: 'A28004326', 
          email: 'atencion@endesa.es', 
          telefon: '900000002',
          adreca: 'Calle Ribera del Loira 60',
          categoria: 'Subministraments', 
          usuari_id: user.id 
        }
      ];
      const providers = await Promise.all(providersData.map(p => Provider.create(p, { transaction })));

      // 5. Create Products
      const productsData = [
        { nom: 'Consultoria IT (hora)', descripcio: 'Servei de consultoria técnica avanzada', preu_unitari: 60.00, tipus_iva: 21.0, usuari_id: user.id },
        { nom: 'Desenvolupament Web', descripcio: 'Programació senior', preu_unitari: 65.00, tipus_iva: 21.0, usuari_id: user.id },
        { nom: 'Manteniment Web', descripcio: 'Backups i seguretat', preu_unitari: 150.00, tipus_iva: 21.0, usuari_id: user.id }
      ];
      const products = await Promise.all(productsData.map(p => Product.create(p, { transaction })));

      // 6. Create Invoices
      // Invoice 1: Paid
      const inv1 = await Invoice.create({
        numero_Factura: '001',
        serie: '2026',
        data_emissio: new Date('2026-01-15'),
        data_venciment: new Date('2026-02-15'),
        estat: 'PAGADA',
        base_imposable: 600.00,
        total_iva: 126.00,
        total: 726.00,
        client_id: clients[0].id,
        usuari_id: user.id
      }, { transaction });

      await InvoiceLine.create({
        descripcio: '10h Consultoria IT',
        quantitat: 10,
        preu_unitari: 60.00,
        tipus_iva: 21.0,
        import_iva: 126.00,
        subtotal: 600.00,
        total_linia: 726.00,
        factura_id: inv1.id,
        producte_id: products[0].id
      }, { transaction });

      // Invoice 2: Overdue
      const inv2 = await Invoice.create({
        numero_Factura: '002',
        serie: '2026',
        data_emissio: new Date('2026-02-10'),
        data_venciment: new Date('2026-03-10'),
        estat: 'VENÇUDA',
        base_imposable: 300.00,
        total_iva: 63.00,
        total: 363.00,
        client_id: clients[1].id,
        usuari_id: user.id
      }, { transaction });

      await InvoiceLine.create({
        descripcio: '5h Consultoria IT',
        quantitat: 5,
        preu_unitari: 60.00,
        tipus_iva: 21.0,
        import_iva: 63.00,
        subtotal: 300.00,
        total_linia: 363.00,
        factura_id: inv2.id,
        producte_id: products[0].id
      }, { transaction });

      // 7. Create Expenses
      await Expense.create({
        descripcio: 'Hosting Mensual AWS',
        categoria: 'Software',
        import_net: 50.00,
        import_iva: 10.50,
        total: 60.50,
        tipus_iva: 21.0,
        data_despesa: new Date('2026-01-20'),
        usuari_id: user.id,
        proveidor_id: providers[0].id
      }, { transaction });

      await Expense.create({
        descripcio: 'Lloguer Oficina Gener',
        categoria: 'Lloguer',
        import_net: 500.00,
        import_iva: 105.00,
        total: 605.00,
        tipus_iva: 21.0,
        data_despesa: new Date('2026-01-05'),
        usuari_id: user.id
      }, { transaction });

      await transaction.commit();
      console.log('✨ Database reset and seeded successfully!');
      process.exit(0);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('❌ Error during reset and seed:', error);
    process.exit(1);
  }
}

resetAndSeed();

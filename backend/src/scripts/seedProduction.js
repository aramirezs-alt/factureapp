const bcrypt = require('bcryptjs');
const { User, BusinessProfile, Client, Provider, Product, Invoice, InvoiceLine, Expense, sequelize } = require('../models');

async function seed() {
  const transaction = await sequelize.transaction();
  try {
    console.log('Starting seed process...');

    // 1. Create Main User
    const passwordHash = await bcrypt.hash('admin123', 10);
    const [user] = await User.findOrCreate({
      where: { email: 'admin@factures.cat' },
      defaults: {
        password_hash: passwordHash,
        rol: 'USER'
      },
      transaction
    });

    // 2. Create Business Profile
    await BusinessProfile.findOrCreate({
      where: { usuari_id: user.id },
      defaults: {
        nom: 'Adrià',
        cognoms: 'Ramírez',
        nom_negoci: 'TronDisc Solucions Digitals',
        nif_cif: '12345678Z',
        iva_defecte: 21.0,
        serie_defecte: '2026'
      },
      transaction
    });

    // 3. Create a Client
    const [client] = await Client.findOrCreate({
      where: { nif: 'B99887766', usuari_id: user.id },
      defaults: {
        nom: 'Empresa Examen SL',
        email: 'facturacio@examen.com',
        ciutat: 'Barcelona',
        telefon: '931112233',
        pais: 'España',
        adreca: 'Calle Diagonal 123',
        codi_postal: '08018'
      },
      transaction
    });

    // 4. Create a Provider
    const [provider] = await Provider.findOrCreate({
      where: { nif: 'W1234567A', usuari_id: user.id },
      defaults: {
        nom: 'Amazon Web Services',
        email: 'billing@aws.com',
        categoria: 'Software',
        telefon: '900800700',
        adreca: 'Seattle Headquarters'
      },
      transaction
    });

    // 5. Create some Products
    const [prod1] = await Product.findOrCreate({
      where: { nom: 'Consultoria IT (hora)', usuari_id: user.id },
      defaults: {
        descripcio: 'Servei de consultoria técnica avanzada',
        preu_unitari: 60.00,
        tipus_iva: 21.0
      },
      transaction
    });

    // 6. Create Invoices
    // Invoice 1: Paid
    const [inv1] = await Invoice.findOrCreate({
      where: { numero_Factura: '001', serie: '2026', usuari_id: user.id },
      defaults: {
        data_emissio: new Date('2026-01-15'),
        data_venciment: new Date('2026-02-15'),
        estat: 'PAGADA',
        base_imposable: 600.00,
        total_iva: 126.00,
        total: 726.00,
        client_id: client.id
      },
      transaction
    });

    await InvoiceLine.findOrCreate({
      where: { factura_id: inv1.id, producte_id: prod1.id },
      defaults: {
        descripcio: '10h Consultoria IT',
        quantitat: 10,
        preu_unitari: 60.00,
        tipus_iva: 21.0,
        import_iva: 126.00,
        subtotal: 600.00,
        total_linia: 726.00
      },
      transaction
    });

    // Invoice 2: Overdue (VENÇUDA)
    const [inv2] = await Invoice.findOrCreate({
      where: { numero_Factura: '002', serie: '2026', usuari_id: user.id },
      defaults: {
        data_emissio: new Date('2026-02-10'),
        data_venciment: new Date('2026-03-10'),
        estat: 'VENÇUDA',
        base_imposable: 300.00,
        total_iva: 63.00,
        total: 363.00,
        client_id: client.id
      },
      transaction
    });

    await InvoiceLine.findOrCreate({
      where: { factura_id: inv2.id, producte_id: prod1.id },
      defaults: {
        descripcio: '5h Consultoria IT',
        quantitat: 5,
        preu_unitari: 60.00,
        tipus_iva: 21.0,
        import_iva: 63.00,
        subtotal: 300.00,
        total_linia: 363.00
      },
      transaction
    });

    // 7. Create Expenses
    await Expense.findOrCreate({
      where: { descripcio: 'Hosting Mensual AWS', usuari_id: user.id },
      defaults: {
        categoria: 'Software',
        import_net: 50.00,
        import_iva: 10.50,
        total: 60.50,
        tipus_iva: 21.0,
        data_despesa: new Date('2026-01-20'),
        proveidor_id: provider.id
      },
      transaction
    });

    await Expense.findOrCreate({
      where: { descripcio: 'Lloguer Oficina Gener', usuari_id: user.id },
      defaults: {
        categoria: 'Lloguer',
        import_net: 500.00,
        import_iva: 105.00,
        total: 605.00,
        tipus_iva: 21.0,
        data_despesa: new Date('2026-01-05')
      },
      transaction
    });

    await transaction.commit();
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();

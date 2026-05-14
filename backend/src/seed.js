const { 
  User, BusinessProfile, Client, Product, Invoice, InvoiceLine, Expense, Provider 
} = require('./models');
const sequelize = require('./config/database');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('Starting seeding process...');
  const t = await sequelize.transaction();

  try {
    // 1. Create or update test user
    const email = 'test@example.com';
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('password123', salt);

    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        email,
        password_hash,
        rol: 'USER'
      }, { transaction: t });
      console.log('Test user created.');
    } else {
      user.password_hash = password_hash;
      await user.save({ transaction: t });
      console.log('Test user password updated.');
    }

    // 2. Business Profile
    await BusinessProfile.findOrCreate({
      where: { usuari_id: user.id },
      defaults: {
        nom: 'Adrià',
        cognoms: 'Ramírez',
        nom_negoci: 'Antigravity Solutions S.L.',
        nif_cif: 'B12345678',
        telefon: '600123456',
        pais: 'España',
        adreca: 'Passeig de Gràcia, 1',
        ciutat: 'Barcelona',
        codi_postal: '08007',
        iva_defecte: 21,
        serie_defecte: 'F2026'
      },
      transaction: t
    });
    console.log('Business profile ready.');

    // 3. Providers
    const providersData = [
      { nom: 'Amazon AWS', email: 'billing@aws.amazon.com', nif: 'N0012345C', adreca: 'Seattle, USA', telefon: '900123456', categoria: 'Tecnologia' },
      { nom: 'Mercadona S.A.', email: 'cliente@mercadona.es', nif: 'A46059717', adreca: 'C/ Valencia, 1', telefon: '900665544', categoria: 'Dietes' },
      { nom: 'Endesa', email: 'atencion@endesa.es', nif: 'A28004326', adreca: 'Ribera del Loira, 60', telefon: '900334455', categoria: 'Subministraments' },
      { nom: 'Telefónica Movistar', email: 'pymes@movistar.es', nif: 'A28015865', adreca: 'Gran Vía, 28', telefon: '900556677', categoria: 'Subministraments' },
      { nom: 'Gasolinera Repsol', email: 'facturacion@repsol.com', nif: 'A78374725', adreca: 'C/ Méndez Álvaro, 44', telefon: '900112233', categoria: 'Transport' }
    ];

    const providers = [];
    for (const pData of providersData) {
      const [p] = await Provider.findOrCreate({
        where: { nif: pData.nif, usuari_id: user.id },
        defaults: pData,
        transaction: t
      });
      providers.push(p);
    }
    console.log('Providers ready.');

    // 4. Clients
    const clientsData = [
      { nom: 'Tech Innovators S.L.', email: 'contact@tech.com', nif: 'B98765432', ciutat: 'Girona', adreca: 'Carrer Major 5', telefon: '972123456', pais: 'España', codi_postal: '17001' },
      { nom: 'Consultoría Balmes', email: 'info@balmes.es', nif: 'B66554433', ciutat: 'Barcelona', adreca: 'Carrer Balmes 120', telefon: '934567890', pais: 'España', codi_postal: '08008' },
      { nom: 'Juan Pérez García', email: 'juan@gmail.com', nif: '12345678Z', ciutat: 'Badalona', adreca: 'Av. Martí i Pujol 20', telefon: '931234455', pais: 'España', codi_postal: '08911' },
      { nom: 'Marketing Digital S.A.', email: 'billing@mkt.es', nif: 'A11223344', ciutat: 'Madrid', adreca: 'Calle Alcalá 45', telefon: '912345678', pais: 'España', codi_postal: '28001' },
      { nom: 'Restaurante El Racó', email: 'reserves@elraco.cat', nif: 'B44332211', ciutat: 'Olot', adreca: 'Plaça de l\'Àngel 3', telefon: '972445566', pais: 'España', codi_postal: '17800' }
    ];

    const clients = [];
    for (const cData of clientsData) {
      const [c] = await Client.findOrCreate({
        where: { nif: cData.nif, usuari_id: user.id },
        defaults: cData,
        transaction: t
      });
      clients.push(c);
    }
    console.log('Clients ready.');

    // 5. Products
    const productsData = [
      { nom: 'Desenvolupament Web Senior', descripcio: 'Hora de consultoria i programació senior', preu_unitari: 65, tipus_iva: 21 },
      { nom: 'Manteniment Web Mensual', descripcio: 'Seguretat, backups i actualitzacions', preu_unitari: 150, tipus_iva: 21 },
      { nom: 'Disseny de Logotip', descripcio: 'Disseny gràfic corporatiu', preu_unitari: 300, tipus_iva: 21 },
      { nom: 'Auditoria SEO', descripcio: 'Anàlisi complet de posicionament', preu_unitari: 450, tipus_iva: 21 },
      { nom: 'Gestió de Xarxes Socials', descripcio: 'Pack mensual 3 publicacions setmanals', preu_unitari: 250, tipus_iva: 21 },
      { nom: 'Llicència Software Anual', descripcio: 'Accés a plataforma Antigravity', preu_unitari: 120, tipus_iva: 21 }
    ];

    const products = [];
    for (const pData of productsData) {
      const [prod] = await Product.findOrCreate({
        where: { nom: pData.nom, usuari_id: user.id },
        defaults: pData,
        transaction: t
      });
      products.push(prod);
    }
    console.log('Products ready.');

    // 6. Expenses
    const expensesData = [
      { descripcio: 'Servidors Cloud - Gener', import_net: 45.50, tipus_iva: 21, data_despesa: '2026-01-05', categoria: 'Tecnologia' },
      { descripcio: 'Dinars de negocis - Picasso', import_net: 120.00, tipus_iva: 10, data_despesa: '2026-01-15', categoria: 'Dietes' },
      { descripcio: 'Material d\'oficina - Amazon', import_net: 34.99, tipus_iva: 21, data_despesa: '2026-02-02', categoria: 'Subministraments' },
      { descripcio: 'Factura Llum - Gener', import_net: 85.00, tipus_iva: 5, data_despesa: '2026-02-10', categoria: 'Subministraments' },
      { descripcio: 'Subscripció ChatGPT Plus', import_net: 18.50, tipus_iva: 21, data_despesa: '2026-02-20', categoria: 'Software' },
      { descripcio: 'Tiquet Benzina - Repsol', import_net: 50.00, tipus_iva: 21, data_despesa: '2026-03-01', categoria: 'Transport' },
      { descripcio: 'Compra setmanal - Mercadona', import_net: 75.40, tipus_iva: 10, data_despesa: '2026-03-10', categoria: 'Dietes' },
      { descripcio: 'Domini web anual', import_net: 12.00, tipus_iva: 21, data_despesa: '2026-03-15', categoria: 'Tecnologia' },
      { descripcio: 'Internet i Mòbil - Movistar', import_net: 60.00, tipus_iva: 21, data_despesa: '2026-03-25', categoria: 'Subministraments' },
      { descripcio: 'Assegurança Professional', import_net: 200.00, tipus_iva: 0, data_despesa: '2026-04-05', categoria: 'Assegurances' }
    ];

    for (const eData of expensesData) {
      const iva = parseFloat((eData.import_net * eData.tipus_iva / 100).toFixed(2));
      const total = eData.import_net + iva;
      
      const provider = providers[Math.floor(Math.random() * providers.length)];

      await Expense.create({
        ...eData,
        import_iva: iva,
        total: total,
        usuari_id: user.id,
        proveidor_id: provider.id
      }, { transaction: t });
    }
    console.log('Expenses ready.');

    // 7. Invoices (10 invoices spread over the year)
    const stats = {
      2026: {
        T1: ['2026-01-20', '2026-02-15', '2026-03-10'],
        T2: ['2026-04-12', '2026-05-05'],
        T3: ['2026-07-10', '2026-08-20', '2026-09-15'],
        T4: ['2026-10-05', '2026-11-20']
      }
    };

    let invCount = 1;
    for (const q of Object.keys(stats[2026])) {
      for (const date of stats[2026][q]) {
        const client = clients[Math.floor(Math.random() * clients.length)];
        const invoiceDate = new Date(date);
        const dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + 30);

        const inv = await Invoice.create({
          numero_Factura: `${invCount.toString().padStart(4, '0')}`,
          serie: 'F2026',
          data_emissio: invoiceDate,
          data_venciment: dueDate,
          estat: Math.random() > 0.3 ? 'PAGADA' : 'ENVIADA',
          base_imposable: 0, // Calculated later
          total_iva: 0,
          total: 0,
          client_id: client.id,
          usuari_id: user.id
        }, { transaction: t });

        // Add 1-3 lines per invoice
        const linesCount = Math.floor(Math.random() * 3) + 1;
        let base = 0;
        let ivaTotal = 0;

        for (let i = 0; i < linesCount; i++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const qty = Math.floor(Math.random() * 10) + 1;
          const price = parseFloat(product.preu_unitari);
          const tax = parseFloat(product.tipus_iva);
          
          const lineBase = price * qty;
          const lineIva = parseFloat((lineBase * tax / 100).toFixed(2));
          const lineTotal = lineBase + lineIva;

          await InvoiceLine.create({
            descripcio: product.nom,
            quantitat: qty,
            preu_unitari: price,
            tipus_iva: tax,
            import_iva: lineIva,
            subtotal: lineBase,
            total_linia: lineTotal,
            factura_id: inv.id,
            producte_id: product.id
          }, { transaction: t });

          base += lineBase;
          ivaTotal += lineIva;
        }

        inv.base_imposable = base;
        inv.total_iva = ivaTotal;
        inv.total = base + ivaTotal;
        await inv.save({ transaction: t });
        invCount++;
      }
    }
    console.log('Invoices ready.');

    await t.commit();
    console.log('Seeding completed successfully!');
    console.log('Test Credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    process.exit(0);
  } catch (error) {
    await t.rollback();
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();

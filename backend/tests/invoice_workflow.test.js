const request = require('supertest');
const app = require('../src/index');
const { User, Client, Product, Invoice, InvoiceLine, sequelize } = require('../src/models');
const jwt = require('jsonwebtoken');

describe('Invoice Workflow and Calculations', () => {
  jest.setTimeout(30000);
  let token;
  let userId;
  let clientId;
  let productId;

  beforeAll(async () => {
    try {
      await sequelize.sync({ force: true });
    } catch (syncError) {
      console.error('Sequelize sync failed with details:', syncError);
      throw syncError;
    }

    // Create a test user
    const user = await User.create({
      email: 'invoice-workflow@example.com',
      password_hash: '$2a$10$7Z7WkK.vD9uM9UfXU1r5.OGk/d0PZ0X6wW9nK6i4w.gZ.w.k.F.e2' // direct hash of 'password123'
    });
    userId = user.id;

    // Generate authenticated session token
    token = jwt.sign({ id: user.id, rol: 'USER' }, process.env.JWT_SECRET || 'testsecret');

    // Create a test client
    const client = await Client.create({
      nom: 'Empresa Test S.L.',
      nif: 'B98765432',
      email: 'factures@empresa.com',
      telefon: '931234567',
      adreca: 'Passeig de Gràcia 45',
      ciutat: 'Barcelona',
      pais: 'España',
      codi_postal: '08007',
      usuari_id: userId
    });
    clientId = client.id;

    // Create a test product
    const product = await Product.create({
      nom: 'Desenvolupament Web Premium',
      preu_unitari: 1500,
      tipus_iva: 21,
      descripcio: 'Desenvolupament complet aplicació',
      usuari_id: userId
    });
    productId = product.id;
  });

  afterAll(async () => {
    // Close DB connection
    await sequelize.close();
  });

  it('should successfully create an invoice and accurately calculate all totals on the backend', async () => {
    const invoicePayload = {
      client_id: clientId,
      serie: 'F2026',
      data_emissio: '2026-05-15',
      data_venciment: '2026-06-15',
      tipus_irpf: 15,
      lines: [
        {
          descripcio: 'Desenvolupament Web Premium',
          quantitat: 2,
          preu_unitari: 1500,
          tipus_iva: 21
        },
        {
          descripcio: 'Manteniment Servidors',
          quantitat: 5,
          preu_unitari: 100,
          tipus_iva: 10
        }
      ]
    };

    const res = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send(invoicePayload);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.serie).toBe('F2026');
    expect(res.body.numero_Factura).toBe('001');

    // Base Imposable: (2 * 1500) + (5 * 100) = 3000 + 500 = 3500.00
    expect(parseFloat(res.body.base_imposable)).toEqual(3500.00);

    // Total IVA: (3000 * 0.21) + (500 * 0.10) = 630 + 50 = 680.00
    expect(parseFloat(res.body.total_iva)).toEqual(680.00);

    // Total IRPF: 3500 * 0.15 = 525.00
    expect(parseFloat(res.body.total_irpf)).toEqual(525.00);

    // Total: Base + IVA - IRPF = 3500 + 680 - 525 = 3655.00
    expect(parseFloat(res.body.total)).toEqual(3655.00);

    // Verify invoice lines are persisted correctly
    expect(res.body.InvoiceLines.length).toBe(2);
    expect(parseFloat(res.body.InvoiceLines[0].subtotal)).toBe(3000.00);
    expect(parseFloat(res.body.InvoiceLines[0].import_iva)).toBe(630.00);
    expect(parseFloat(res.body.InvoiceLines[0].total_linia)).toBe(3630.00);
  });

  it('should generate a PDF binary for a given invoice', async () => {
    // Find the invoice created in previous test
    const invoice = await Invoice.findOne({ where: { usuari_id: userId } });
    expect(invoice).not.toBeNull();

    const res = await request(app)
      .get(`/api/invoices/${invoice.id}/pdf`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.header['content-type']).toBe('application/pdf');
    // PDF magic number check (%PDF-)
    expect(res.body.toString().slice(0, 4)).toBe('%PDF');
  });

  it('should export all invoices to a clean CSV layout', async () => {
    const res = await request(app)
      .get('/api/invoices/export')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.header['content-type']).toContain('text/csv');
    expect(res.text).toContain('"Número";"Sèrie";"Client";"NIF Client"');
    expect(res.text).toContain('F2026');
    expect(res.text).toContain('Empresa Test S.L.');
  });
});

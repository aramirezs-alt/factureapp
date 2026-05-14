const request = require('supertest');
const app = require('../src/index');
const { User, Client, Product, Invoice, sequelize } = require('../src/models');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

describe('New Features Endpoints', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Create test user
    const user = await User.create({
      email: 'features-test@example.com',
      password_hash: 'hashedpassword' // direct hash for testing
    });
    userId = user.id;
    
    // Generate token
    token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'testsecret');

    // Create a client
    await Client.create({
      nom: 'Test Client',
      nif: '12345678A',
      email: 'client@test.com',
      telefon: '123456789',
      adreca: 'Calle Falsa 123',
      ciutat: 'Barcelona',
      pais: 'España',
      codi_postal: '08001',
      usuari_id: userId
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Invoice CSV Export', () => {
    it('should export invoices to CSV', async () => {
      const res = await request(app)
        .get('/api/invoices/export')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.header['content-type']).toBe('text/csv; charset=utf-8');
      expect(res.text).toContain('Número');
      expect(res.text).toContain('Sèrie');
      expect(res.text).toContain('NIF Client');
    });
  });

  describe('Backup and Restore', () => {
    it('should export a full backup JSON', async () => {
      const res = await request(app)
        .get('/api/backup')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.header['content-type']).toContain('application/json');
      expect(res.body.data).toHaveProperty('clients');
      expect(res.body.data).toHaveProperty('products');
    });

    it('should restore from a backup JSON', async () => {
      const backupData = {
        version: '1.0',
        data: {
          clients: [
            { nom: 'Restored Client', nif: '87654321B', email: 'restored@test.com', telefon: '987654321', adreca: 'Test', ciutat: 'Test', pais: 'Test', codi_postal: '00000' }
          ],
          products: [
            { nom: 'Restored Product', preu_unitari: 50, tipus_iva: 21, descripcio: 'Test' }
          ]
        }
      };

      const res = await request(app)
        .post('/api/backup/restore')
        .set('Authorization', `Bearer ${token}`)
        .send(backupData);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.summary.clients).toBe(1);
      expect(res.body.summary.products).toBe(1);

      // Verify client was created
      const client = await Client.findOne({ where: { nif: '87654321B' } });
      expect(client).not.toBeNull();
      expect(client.nom).toBe('Restored Client');
    });
  });

  describe('Client CSV Import', () => {
    it('should import clients from CSV file', async () => {
      const csvPath = path.join(__dirname, 'test_clients.csv');
      fs.writeFileSync(csvPath, 'nom;email;nif;telefon;adreca;codi_postal;ciutat;pais\nImported CSV Client;csv@test.com;11223344K;666777888;Calle CSV;08002;Barcelona;España');

      const res = await request(app)
        .post('/api/clients/import')
        .set('Authorization', `Bearer ${token}`)
        .attach('csv', csvPath);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.imported).toBe(1);
      
      fs.unlinkSync(csvPath);

      const client = await Client.findOne({ where: { nif: '11223344K' } });
      expect(client).not.toBeNull();
    });
  });

  describe('IVA Report Export', () => {
    it('should export IVA report to CSV', async () => {
      const res = await request(app)
        .get('/api/stats/iva/2026/1/export')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.header['content-type']).toBe('text/csv; charset=utf-8');
      expect(res.text).toContain('Tipus');
      expect(res.text).toContain('Data');
      expect(res.text).toContain('Referència');
    });
  });
});

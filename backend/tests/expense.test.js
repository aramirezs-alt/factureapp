const request = require('supertest');
const app = require('../src/index');
const { User, Expense, Provider, sequelize } = require('../src/models');
const jwt = require('jsonwebtoken');

describe('Expense Endpoints', () => {
  let token;
  let userId;
  let providerId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Create test user
    const user = await User.create({
      email: 'expense-test@example.com',
      password: '12345678'
    });
    userId = user.id;
    
    // Generate token
    token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    // Create test provider
    const provider = await Provider.create({
      nom: 'Test Provider',
      nif: 'B12345678',
      email: 'provider@test.com',
      usuari_id: userId,
      categoria: 'Software'
    });
    providerId = provider.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a new expense', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        descripcio: 'Test Expense',
        categoria: 'Software',
        import_net: 100,
        tipus_iva: 21,
        import_iva: 21,
        total: 121,
        data_despesa: new Date(),
        proveidor_id: providerId
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.descripcio).toBe('Test Expense');
  });

  it('should get all expenses for the user', async () => {
    const res = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it('should fail validation when missing fields', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        descripcio: '',
        total: -10
      });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
  });
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/database');
const { initCronJobs, runOverdueInvoicesCheck, runRecurringExpensesCheck } = require('./services/cronService');
const { verifyTransporter } = require('./services/emailService');

const app = express();

// Initialize services
if (process.env.NODE_ENV !== 'test') {
  initCronJobs();
  verifyTransporter();
}

// Trust proxy for rate limiting behind Vercel/Load Balancers
app.set('trust proxy', 1);

// Middlewares
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());
const authMiddleware = require('./middleware/authMiddleware');
const uploadController = require('./controllers/uploadController');
app.use(express.json());

// Protected route for uploads
app.get('/uploads/:type/:filename', authMiddleware, uploadController.getFile);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/business', require('./routes/businessRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/providers', require('./routes/providerRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/advisors', require('./routes/advisorRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/backup', require('./routes/backupRoutes'));

app.post('/api/cron/trigger', async (req, res) => {
  const token = req.query.token;
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return res.status(401).json({ message: 'Unauthorized cron trigger' });
  }
  try {
    const overdue = await runOverdueInvoicesCheck();
    const recurring = await runRecurringExpensesCheck();
    res.json({ message: 'Cron jobs executed manually', overdue_marked: overdue, recurring_generated: recurring });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    env: process.env.NODE_ENV,
    hasDbUrl: !!process.env.DATABASE_URL,
    hasJwtSecret: !!process.env.JWT_SECRET
  });
});

app.get('/api/test-db', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ message: 'Database connection ok' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/setup-db', async (req, res) => {
  try {
    await sequelize.sync({ alter: true });
    res.json({ message: 'Database synchronized successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Database connection and server start
// Database connection
async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

connectDB();

const PORT = process.env.PORT || 3000;

// Només escoltem si no estem a Vercel (opcional, Vercel no usa listen)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof require('multer').MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'El fitxer és massa gran. El límit són 10MB.' });
    }
    return res.status(400).json({ message: `Error en la pujada: ${err.message}` });
  }

  if (err.message && err.message.includes('Tipus de fitxer no permès')) {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({ message: 'Error intern del servidor' });
});

module.exports = app;


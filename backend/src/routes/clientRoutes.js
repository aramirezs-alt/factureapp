const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer for CSV import – stores in a temp dir
const csvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    const dir = 'uploads/csv-tmp/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const uploadCSV = multer({
  storage: csvStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) cb(null, true);
    else cb(new Error('Només s\'accepten fitxers CSV.'), false);
  }
});

const roleMiddleware = require('../middleware/roleMiddleware');

// All routes are protected
router.use(authMiddleware);

router.get('/', clientController.getAll);
router.get('/:id', clientController.getOne);

// Accions de mutació reservades per a USER i ADMIN
router.post('/import', roleMiddleware(['USER', 'ADMIN']), uploadCSV.single('csv'), clientController.importFromCSV);
router.post('/', roleMiddleware(['USER', 'ADMIN']), clientController.create);
router.put('/:id', roleMiddleware(['USER', 'ADMIN']), clientController.update);
router.delete('/:id', roleMiddleware(['USER', 'ADMIN']), clientController.delete);

module.exports = router;

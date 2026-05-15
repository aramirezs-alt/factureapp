const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer for CSV import
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

router.get('/', productController.getAll);
router.get('/:id', productController.getOne);

// Accions de mutació reservades per a USER i ADMIN
router.post('/import', roleMiddleware(['USER', 'ADMIN']), uploadCSV.single('csv'), productController.importFromCSV);
router.post('/', roleMiddleware(['USER', 'ADMIN']), productController.create);
router.put('/:id', roleMiddleware(['USER', 'ADMIN']), productController.update);
router.delete('/:id', roleMiddleware(['USER', 'ADMIN']), productController.delete);

module.exports = router;

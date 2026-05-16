const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const ocrController = require('../controllers/ocrController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateFile } = require('../middleware/fileValidator');
const validate = require('../middleware/validate');
const { expenseValidation } = require('../validations/expenseValidation');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = 'uploads/expenses/';
    const fs = require('fs');
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipus de fitxer no permès. Només s\'accepten imatges (JPG, PNG) i PDF.'), false);
    }
  }
});

const expenseFileValidator = validateFile(['image/jpeg', 'image/png', 'application/pdf']);

// Separate multer for OCR – stores in a temp folder, images only
const ocrStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tmpDir = 'uploads/ocr-tmp/';
    const fs = require('fs');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const uploadOcr = multer({
  storage: ocrStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Només s\'accepten imatges (JPG, PNG, WEBP) per a l\'OCR.'), false);
  }
});

// Helper per capturar errors de Multer
const handleMulterError = (multerUpload) => (req, res, next) => {
  multerUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'L\'arxiu és massa gran (màxim 10MB).' });
      }
      return res.status(400).json({ message: `Error en la pujada: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.get('/export', expenseController.exportToCSV);
router.get('/', expenseController.getAll);
router.get('/:id', expenseController.getOne);

// Accions de mutació i eines reservades per a USER i ADMIN
router.post('/ocr-scan', roleMiddleware(['USER', 'ADMIN']), handleMulterError(uploadOcr.single('tiquet')), ocrController.scan);
router.post('/', roleMiddleware(['USER', 'ADMIN']), handleMulterError(upload.single('adjunt')), expenseValidation, validate, expenseFileValidator, expenseController.create);
router.put('/:id', roleMiddleware(['USER', 'ADMIN']), handleMulterError(upload.single('adjunt')), expenseValidation, validate, expenseFileValidator, expenseController.update);
router.delete('/:id', roleMiddleware(['USER', 'ADMIN']), expenseController.delete);

module.exports = router;

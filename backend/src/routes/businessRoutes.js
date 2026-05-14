const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateFile } = require('../middleware/fileValidator');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/logos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipus de fitxer no permès. Només s\'accepten imatges (JPG, PNG) per al logo.'), false);
    }
  }
});

const logoFileValidator = validateFile(['image/jpeg', 'image/png']);

// All routes here are protected
router.use(authMiddleware);

router.get('/profile', businessController.getProfile);
router.put('/profile', upload.single('logo'), logoFileValidator, businessController.updateProfile);

module.exports = router;

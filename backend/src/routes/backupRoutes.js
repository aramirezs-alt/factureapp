const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/',        backupController.export);
router.post('/restore', backupController.restore);

module.exports = router;

const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/dashboard', authMiddleware, statsController.getTaulerStats);
router.get('/iva/:year/:quarter/export', authMiddleware, statsController.exportIVA);
router.get('/tax-report/:year', authMiddleware, statsController.getTaxReport);

module.exports = router;

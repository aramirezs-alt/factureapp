const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/authMiddleware');
const { invoiceValidation } = require('../validations/invoiceValidation');
const validate = require('../middleware/validate');

router.use(authMiddleware);

router.get('/export', invoiceController.exportToCSV);
router.get('/', invoiceController.getAll);
router.get('/:id', invoiceController.getOne);
router.post('/:id/send', invoiceController.sendByEmail);
router.get('/:id/pdf', invoiceController.generatePDF);
router.post('/', invoiceValidation, validate, invoiceController.create);
router.put('/:id', invoiceValidation, validate, invoiceController.update);
router.patch('/:id/status', invoiceController.updateStatus);
router.delete('/:id', invoiceController.delete);

module.exports = router;

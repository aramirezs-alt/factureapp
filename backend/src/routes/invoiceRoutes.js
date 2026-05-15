const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/authMiddleware');
const { invoiceValidation } = require('../validations/invoiceValidation');
const validate = require('../middleware/validate');

const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/export', invoiceController.exportToCSV);
router.get('/', invoiceController.getAll);
router.get('/:id', invoiceController.getOne);
router.get('/:id/pdf', invoiceController.generatePDF);

// Accions reservades per a USER i ADMIN
router.post('/', roleMiddleware(['USER', 'ADMIN']), invoiceValidation, validate, invoiceController.create);
router.put('/:id', roleMiddleware(['USER', 'ADMIN']), invoiceValidation, validate, invoiceController.update);
router.post('/:id/send', roleMiddleware(['USER', 'ADMIN']), invoiceController.sendByEmail);
router.patch('/:id/status', roleMiddleware(['USER', 'ADMIN']), invoiceController.updateStatus);
router.post('/:id/duplicate', roleMiddleware(['USER', 'ADMIN']), invoiceController.duplicate);
router.delete('/:id', roleMiddleware(['USER', 'ADMIN']), invoiceController.delete);

module.exports = router;

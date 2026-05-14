const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', providerController.getAll);
router.get('/:id', providerController.getOne);
router.post('/', providerController.create);
router.put('/:id', providerController.update);
router.delete('/:id', providerController.delete);

module.exports = router;

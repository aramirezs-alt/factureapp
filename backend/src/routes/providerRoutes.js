const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const authMiddleware = require('../middleware/authMiddleware');

const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/', providerController.getAll);
router.get('/:id', providerController.getOne);

// Accions de mutació reservades per a USER i ADMIN
router.post('/', roleMiddleware(['USER', 'ADMIN']), providerController.create);
router.put('/:id', roleMiddleware(['USER', 'ADMIN']), providerController.update);
router.delete('/:id', roleMiddleware(['USER', 'ADMIN']), providerController.delete);

module.exports = router;

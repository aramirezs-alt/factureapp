const express = require('express');
const router = express.Router();
const advisorController = require('../controllers/advisorController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// User grants access to an advisor
router.post('/grant', advisorController.grantAccess);

// User sees which advisors have access to their data
router.get('/my-advisors', advisorController.getMyAdvisors);

// Advisor sees which clients they can access
router.get('/my-clients', advisorController.getMyClients);

// Advisor reads a specific client's summary (stats + profile)
router.get('/client/:clientId/summary', advisorController.getClientSummary);

// Advisor reads a specific client's invoices
router.get('/client/:clientId/invoices', advisorController.getClientInvoices);

// User revokes access
router.put('/:id/revoke', advisorController.revokeAccess);

module.exports = router;

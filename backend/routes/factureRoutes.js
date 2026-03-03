const express = require('express');
const router = express.Router();
const factureController = require('../controllers/factureController');

router.post('/generate', factureController.createFacturesMensuelles);
router.get('/getall', factureController.getAllFactures); // <-- GET ALL FACTURES

module.exports = router;
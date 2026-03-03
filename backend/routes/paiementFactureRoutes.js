const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiementFactureController');

// Création d'un paiement
router.post('/create', paiementController.createPaiement);

// Récupérer tous les paiements
router.get('/getall', paiementController.getAllPaiements);

module.exports = router;
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Endpoint pour récupérer tous les KPIs et tops
router.get('/kpi/:shopId', dashboardController.getKPI);
router.get('/admin', dashboardController.getDashboardStats);


module.exports = router;
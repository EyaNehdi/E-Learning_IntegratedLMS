const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');

router.get('/transactions', financeController.getRecentTransactions);
router.get('/avg-time-to-first-purchase', financeController.getAvgTimeToFirstPurchase);
router.get('/top-spenders', financeController.getTopSpenders);
router.get('/total-revenue', financeController.getTotalRevenue);
router.get('/pack/:id/analytics', financeController.getPackAnalytics);
router.get('/export', financeController.exportTransactions);

module.exports = router;
var express = require('express');
const transactionController = require('../controller/transaction');
const { authenticate } = require('../controller/authController');

var router = express.Router();

/* GET users listing. */
router.post('/redeem',authenticate,transactionController.redeem);



module.exports = router;

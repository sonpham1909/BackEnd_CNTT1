var express = require('express');
const { register } = require('../controller/authController');
var router = express.Router();

/* GET users listing. */
router.post('/register',register);

module.exports = router;

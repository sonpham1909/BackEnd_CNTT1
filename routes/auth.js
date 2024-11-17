var express = require('express');
const { register, login, updatePublicKey, authenticate, getUserInfo } = require('../controller/authController');
var router = express.Router();

/* GET users listing. */
router.post('/register',register);

router.post('/login',login);

router.put('/update-public-key', authenticate, updatePublicKey);

router.get('/get_user_infor', authenticate, getUserInfo);

module.exports = router;

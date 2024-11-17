var express = require('express');
const { register, login, updatePublicKey, authenticate, getUserInfo, updateUser, checkIn } = require('../controller/authController');
var router = express.Router();

/* GET users listing. */
router.post('/register',register);

router.post('/login',login);

router.put('/update-public-key', authenticate, updatePublicKey);

router.get('/get_user_infor', authenticate, getUserInfo);

router.put('/update', authenticate, updateUser);

router.post('/check_in', authenticate, checkIn);

module.exports = router;

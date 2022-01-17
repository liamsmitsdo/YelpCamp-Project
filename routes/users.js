const express = require('express');
const router = express.Router();
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync');
const User = require('../models/user');
const users = require('../controllers/users');

router.route('/register')
    .get(users.register)
    .post(wrapAsync(users.postRegister));

router.route('/login')
    .get(users.login)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.postLogin);

router.get('/logout', users.logout);

module.exports = router;
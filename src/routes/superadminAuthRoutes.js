const express = require('express');
const router = express.Router();

const { superadminLogin } = require('../controllers/authSuperAdminController');

router.post('/login', superadminLogin);

module.exports = router;

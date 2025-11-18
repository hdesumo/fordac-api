const express = require('express');
const router = express.Router();

const { login } = require('../controllers/authSuperAdminController');

// Route login superadmin
router.post('/login', login);

module.exports = router;

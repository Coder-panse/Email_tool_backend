const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', protect, emailController.sendBulkEmails);

module.exports = router;

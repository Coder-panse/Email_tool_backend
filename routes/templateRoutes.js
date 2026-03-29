const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, templateController.getTemplates)
  .post(protect, templateController.createTemplate);

router.route('/:id')
  .put(protect, templateController.updateTemplate)
  .delete(protect, templateController.deleteTemplate)
  .patch(protect, templateController.setDefaultTemplate);

module.exports = router;

const Template = require('../models/Template');

// GET /api/templates
exports.getTemplates = async (req, res) => {
  try {
    const templates = await Template.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Server error retrieving templates' });
  }
};

// POST /api/templates
exports.createTemplate = async (req, res) => {
  try {
    const { name, subject, body } = req.body;
    const newTemplate = new Template({ 
      name, 
      subject, 
      body,
      user: req.user.id 
    });
    await newTemplate.save();
    res.status(201).json(newTemplate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create template' });
  }
};

// PUT /api/templates/:id
exports.updateTemplate = async (req, res) => {
  try {
    const { name, subject, body } = req.body;
    
    // Check if template exists and belongs to user
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    if (template.user.toString() !== req.user.id) {
      return res.status(401).json({ error: 'User not authorized' });
    }

    const updatedTemplate = await Template.findByIdAndUpdate(
      req.params.id,
      { name, subject, body },
      { new: true, runValidators: true }
    );
    res.status(200).json(updatedTemplate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update template' });
  }
};

// DELETE /api/templates/:id
exports.deleteTemplate = async (req, res) => {
  try {
    // Check if template exists and belongs to user
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    if (template.user.toString() !== req.user.id) {
      return res.status(401).json({ error: 'User not authorized' });
    }

    await Template.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete template' });
  }
};

// PATCH /api/templates/:id/default
exports.setDefaultTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    if (template.user.toString() !== req.user.id) {
      return res.status(401).json({ error: 'User not authorized' });
    }

    // Unset all other defaults for this user
    await Template.updateMany({ user: req.user.id }, { isDefault: false });

    // Set this one as default
    template.isDefault = true;
    await template.save();

    res.status(200).json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to set default template' });
  }
};

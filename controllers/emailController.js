
const nodemailer = require('nodemailer');
const Template = require('../models/Template');

exports.sendBulkEmails = async (req, res) => {
  try {
    const { contacts, template: requestTemplate } = req.body;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ error: 'No contacts provided in payload' });
    }

    // ✅ SMTP Config
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // important for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      family: 4, 
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
    });

    // ✅ Dynamic replace function
    const replaceVariables = (template, data) => {
      return template.replace(/{(.*?)}/g, (_, key) => {
        const foundKey = Object.keys(data).find(
          k => k.toLowerCase() === key.toLowerCase()
        );
        return foundKey ? data[foundKey] : '';
      });
    };

    let successCount = 0;
    let failCount = 0;

    for (let contact of contacts) {
      if (!contact.Email) {
        failCount++;
        continue;
      }

      // ✅ Fetch Template logic (with fallback)
      let template = null;
      if (contact.Template) {
        template = await Template.findOne({ user: req.user.id, name: contact.Template });
      }

      // If template still not found or missing, use default
      if (!template) {
        template = await Template.findOne({ user: req.user.id, isDefault: true });
      }

      // ✅ Final safety check
      if (!template) {
        console.log(`No valid or default template found for ${contact.Email}`);
        failCount++;
        continue;
      }

      // ✅ Dynamic variable replacement (FIXED)
      const personalizedBody = replaceVariables(template.body, contact);
      const personalizedSubject = replaceVariables(template.subject, contact);

      try {
        await transporter.sendMail({
          from: `"Techiweb" <${process.env.SMTP_USER || 'no-reply@demo.com'}>`,
          to: contact.Email,
          subject: personalizedSubject,
          text: personalizedBody,
        });
        successCount++;

      } catch (err) {
        console.error(`Failed to dispatch to ${contact.Email}:`, err.message);
        failCount++;
      }
    }

    return res.status(200).json({
      message: 'Dispatch finished successfully',
      stats: { total: contacts.length, successful: successCount, failed: failCount }
    });

  } catch (error) {
    console.error('Dispatch API Error:', error);
    res.status(500).json({ error: 'Internal Server Error during email dispatch' });
  }
};

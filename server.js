const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false }));

// Email route
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  // Configure your SMTP transporter
  const transporter = nodemailer.createTransport({
    service: 'Outlook', // Or another service like 'SendGrid', 'Outlook', etc.
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Email content
  const mailOptions = {
    from: email,
    to: process.env.EMAIL_RECEIVER, 
    subject: `Contact Form from ${name}`,
    text: `You received a message:\n\nFrom: ${name} <${email}>\n\nMessage:\n${message}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.send('<h1>Message sent successfully!</h1><a href="/">Go back</a>');
  } catch (error) {
    console.error('Email error:', error);
    res.send('<h1>Error sending message. Please try again later.</h1>');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

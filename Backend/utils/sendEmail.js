// sendEmail.js

const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // or SMTP
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: '"Imglys" <no-reply@imglys.com>',
    to: email,
    subject,
    html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;

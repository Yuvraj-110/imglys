const nodemailer = require('nodemailer');

const sendFeedbackReplyEmail = async (toEmail, subject, htmlContent) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Imglys Feedback" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendFeedbackReplyEmail;

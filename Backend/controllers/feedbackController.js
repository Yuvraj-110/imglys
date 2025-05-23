const Feedback = require('../models/Feedback');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/user');
const sendFeedbackReplyEmail = require('../utils/sendFeedbackReplyEmail');


exports.submitFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.create({
      user: req.user.id,
      subject: req.body.subject,
      message: req.body.message,
      rating: req.body.rating,
    });

    const user = await User.findById(req.user.id);

    await sendEmail(
      'imglys.info@gmail.com',
      `📝 New Feedback from ${user.name}`,
      `
        <h3>New Feedback Submitted</h3>
        <p><strong>From:</strong> ${user.name} (${user.email})</p>
        <p><strong>Subject:</strong> ${feedback.subject}</p>
        <p><strong>Rating:</strong> ${feedback.rating}</p>
        <p>${feedback.message}</p>
      `
    );

    res.status(201).json(feedback);
  } catch (err) {
    console.error('Submit feedback error:', err);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
};


// Admin gets all feedback
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('user', 'name email');
    res.json(feedbacks);
  } catch (err) {
    console.error('Fetch feedback error:', err);
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
};

// Admin deletes feedback
exports.deleteFeedback = async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    console.error('Delete feedback error:', err);
    res.status(500).json({ message: 'Failed to delete feedback' });
  }
};


exports.replyToFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id).populate('user', 'name email');
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

    feedback.reply = req.body.reply;
    await feedback.save();

    // Send reply email
   const htmlContent = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; background-color: #ffffff;">
    <h2 style="color: #4A90E2; border-bottom: 1px solid #eee; padding-bottom: 8px;">Reply to Your Feedback</h2>

    <p style="font-size: 16px; color: #333;">Hi <strong>${feedback.user.name}</strong>,</p>

    <p style="font-size: 15px; color: #444;">
      Thank you for your feedback titled: 
      <span style="font-weight: 600; color: #000;">"${feedback.subject}"</span>
    </p>

    <p style="font-size: 15px; margin-top: 20px; color: #333;"><strong>Our Reply:</strong></p>
    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4A90E2; margin: 10px 0; font-size: 14px; color: #555;">
      ${req.body.reply}
    </div>

    <p style="font-size: 14px; color: #666;">If you have any further questions, feel free to reach out.</p>

    <p style="margin-top: 30px; font-size: 14px; color: #999;">— Imglys Team</p>
  </div>
`;


    await sendFeedbackReplyEmail(feedback.user.email, 'Reply to Your Feedback', htmlContent);

    res.json({ message: 'Reply sent and saved successfully', feedback });
  } catch (err) {
    console.error('Reply feedback error:', err);
    res.status(500).json({ message: 'Failed to send reply' });
  }
};


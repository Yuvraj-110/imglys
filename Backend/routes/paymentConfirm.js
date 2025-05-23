const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

// Confirm payment and save transaction
router.post("/confirm", authMiddleware, async (req, res) => {
  try {
    const { orderId, paymentId, amount, planName } = req.body;
    const userId = req.user.id;

    if (!orderId || !paymentId || !amount || !planName) {
      return res.status(400).json({ message: "Missing required payment details." });
    }

    const transaction = new Transaction({
      user: userId,
      orderId,
      paymentId,
      amount,
      planName,
    });

    await transaction.save();

    res.status(201).json({ message: "Transaction saved successfully." });
  } catch (err) {
    console.error("Error saving transaction:", err);
    res.status(500).json({ message: "Failed to save transaction." });
  }
});

module.exports = router;

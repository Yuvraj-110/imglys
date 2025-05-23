const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  items: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // ✅ Enable individual deletion
      url: { type: String, required: true },
      type: { type: String, required: true },
      addedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Collection", collectionSchema);

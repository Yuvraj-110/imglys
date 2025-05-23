// Media.js
const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  type: String,         // image, video, gif, etc.
  url: String,          // media link
  title: String,        // caption or title
  source: String        // Pixabay, Unsplash, etc.
}, {
  timestamps: true      // createdAt and updatedAt auto fields
});

module.exports = mongoose.model("Media", mediaSchema);

const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  features: {
    searchesPerDay: Number,
    quality: String,
    aiTools: [String],
    ads: Boolean,
    downloadHistoryDays: Number,
    apiAccess: Boolean,
    supportPriority: Boolean
  },
   duration: Number 
});

module.exports = mongoose.model("Plan", planSchema);

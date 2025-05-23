// utils/seedPlans.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Plan = require("../models/plan");

dotenv.config();

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const plans = [
      {
        name: "free",
        price: 0,
        features: {
          searchesPerDay: 20,
          quality: "medium",
          aiTools: ["bg_remover"],
          ads: true,
          downloadHistoryDays: 0,
          apiAccess: false,
          supportPriority: false,
        },
      },
      {
        name: "pro",
        price: 9.99,
        features: {
          searchesPerDay: 100,
          quality: "high",
          aiTools: ["bg_remover", "logo_maker", "prompt_generator"],
          ads: false,
          downloadHistoryDays: 7,
          apiAccess: false,
          supportPriority: false,
        },
      },
      {
        name: "premium",
        price: 29.99,
        features: {
          searchesPerDay: -1,
          quality: "original",
          aiTools: ["all"],
          ads: false,
          downloadHistoryDays: 30,
          apiAccess: true,
          supportPriority: true,
        },
      }
    ];

    await Plan.deleteMany({});
    await Plan.insertMany(plans);
    console.log("✅ Subscription plans seeded successfully.");
    process.exit();
  } catch (err) {
    console.error("❌ Failed to seed plans:", err);
    process.exit(1);
  }
};

seedPlans();

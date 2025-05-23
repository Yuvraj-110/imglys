const User = require("../models/user");
const fs = require("fs");
const path = require("path");
const random = Math.floor(Math.random() * 10000);
const randomAvatar = `https://api.dicebear.com/7.x/thumbs/svg?seed=user${random}`;
const Plan = require("../models/plan");


// GET /api/profile/:id
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// PUT /api/profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      bio,
      phone,
      gender,
      ageGroup,
      role,
      purpose
    } = req.body;

  const updateData = {
      name,
      bio,
      phone,
      gender,
      ageGroup,
      role,
      purpose
    };

    // If a new profile picture was uploaded
    if (req.file) {
      updateData.profilePicture = `/Backend/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating profile" });
  }
};


const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("plan");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

   res.json({
  _id: user._id,
  name: user.name,
  email: user.email,
  bio: user.bio,
  profilePicture: user.profilePicture,
  gender: user.gender,          // ✅ Add this
  ageGroup: user.ageGroup,      // ✅ Add this
  role: user.role,              // ✅ Add this
  purpose: user.purpose,        // ✅ Add this
  plan: user.plan?.name || "none",
  planFeatures: user.plan?.features || {},
  planExpiresAt: user.planExpiresAt,
  onboarded: user.onboarded,
});
  } catch (error) {
    console.error("Failed to get profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};



const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const imagePath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profilePicture: imagePath },
            { new: true }
        ).select("-password");

        res.json({
            message: "Profile picture updated successfully",
            profilePicture: imagePath,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const completeOnboarding = async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      phone: req.body.phone || "",
      role: req.body.role,
      purpose: req.body.purpose,
      gender: req.body.gender,
    ageGroup: req.body.ageGroup,

      onboarded: true,
    };

    // Handle profile picture
    if (req.file) {
      updates.profilePicture = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    } else {
      // Assign a random sample image
      const randomSeed = Math.floor(Math.random() * 100000);
        updates.profilePicture = `https://api.dicebear.com/7.x/thumbs/svg?seed=${randomSeed}`;

    }

    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true });

    res.json({ message: "Onboarding complete", user });
  } catch (err) {
    console.error("Onboarding error:", err);
    res.status(500).json({ message: "Onboarding failed" });
  }
};



const updateUserPlan = async (req, res) => {
  try {
    console.log("🔧 updateUserPlan triggered");
    console.log("Request body:", req.body);
    console.log("User from authMiddleware:", req.user);

    const { planName } = req.body;
    if (!planName) return res.status(400).json({ message: "Plan name is required" });

    const plan = await Plan.findOne({ name: planName.toLowerCase() });
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const user = await User.findById(req.user.id); // ✅ Fetch full user document
    if (!user) return res.status(404).json({ message: "User not found" });

    user.plan = plan._id;
    user.planExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days from now
    await user.save();

    res.status(200).json({ message: "Plan updated successfully", plan });
  } catch (error) {
    console.error("❌ Error in updateUserPlan:", error);
    res.status(500).json({ message: "Failed to update plan", error: error.message });
  }
};

module.exports = {
    getProfile,
    updateProfile,
    getMyProfile,
    uploadProfilePicture,
    completeOnboarding,
    updateUserPlan
};

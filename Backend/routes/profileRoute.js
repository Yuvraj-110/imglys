const express = require("express");
const router = express.Router();
const { getProfile, updateProfile, getMyProfile, updateUserPlan ,completeOnboarding, } = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require('../middleware/uploadMiddleware');


// Logged-in user's own profile
router.get("/me", authMiddleware, getMyProfile);

// Public - any user's profile by ID
router.get("/:id", getProfile);
router.put("/onboarding", authMiddleware, upload.single("profilePicture"), completeOnboarding);



router.put(
  "/",
  authMiddleware,
  upload.single('profilePicture'),
  updateProfile
);

router.put('/plan', authMiddleware, updateUserPlan);
// router.put('/plan', (req, res) => {
//   res.json({ message: "PUT /plan route is working" });
// });



module.exports = router;

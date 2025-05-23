const User = require('../models/user');

const checkFeatureAccess = (requiredFeature, subFeature = null) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).populate('plan');
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (!user.plan) return res.status(403).json({ message: 'No active plan found' });
      console.log(`🔍 User ${user.email} is on '${user.plan.name}' plan`);


      const features = user.plan.features;
      if (!features) return res.status(403).json({ message: 'No features found in your plan' });

      // If feature is an array (like aiTools) and checking for a specific tool
      if (subFeature && Array.isArray(features[requiredFeature])) {
        const tools = features[requiredFeature];
        if (!tools.includes(subFeature) && !tools.includes('all')) {
          return res.status(403).json({ message: 'Upgrade your plan to access this feature' });
        }
      } else {
        // For boolean features (e.g., apiAccess)
        if (!features[requiredFeature]) {
          return res.status(403).json({ message: 'Upgrade your plan to access this feature' });
        }
      }

      next();
    } catch (error) {
      console.error('🔐 Feature access check failed:', error);
      res.status(500).json({ message: 'Server error during feature check' });
    }
  };
};

module.exports = checkFeatureAccess;

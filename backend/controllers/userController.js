import User from '../models/User.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/profile/preferences
// @access  Private
export const updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      if (req.body.preferences) {
        user.preferences = req.body.preferences;
      }
      if (req.body.gender) {
        user.gender = req.body.gender;
      }
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        gender: updatedUser.gender,
        preferences: updatedUser.preferences,
        savedDestinations: updatedUser.savedDestinations
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add a destination to saved list
// @route   POST /api/users/profile/destinations
// @access  Private
export const addSavedDestination = async (req, res) => {
  try {
    const { destination } = req.body;
    const user = await User.findById(req.user._id);
    
    if (user) {
      if (!user.savedDestinations.includes(destination)) {
        user.savedDestinations.push(destination);
        await user.save();
      }
      res.json(user.savedDestinations);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Remove a destination from saved list
// @route   DELETE /api/users/profile/destinations/:name
// @access  Private
export const removeSavedDestination = async (req, res) => {
  try {
    const destination = req.params.name;
    const user = await User.findById(req.user._id);
    
    if (user) {
      user.savedDestinations = user.savedDestinations.filter(d => d !== destination);
      await user.save();
      res.json(user.savedDestinations);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

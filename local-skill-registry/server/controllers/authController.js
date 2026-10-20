const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_panchayat_key_2026_local_skill_registry',
    { expiresIn: '7d' }
  );
};

// @desc    Panchayat Clerk / Admin Login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username and password.',
      });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your username and password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your username and password.',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful. Welcome to Panchayat Administration.',
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        panchayatName: user.panchayatName,
        village: user.village,
      },
    });
  } catch (err) {
    console.error('Error in login:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
      error: err.message,
    });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile.',
      error: err.message,
    });
  }
};

module.exports = {
  login,
  getMe,
};

const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const User = require('../models/User');

router.get('/', protect, adminOnly, async (req, res) => {
  const users = await User.find().select('-password');
  res.json({ success: true, data: users });
});

module.exports = router;

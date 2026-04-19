const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');

// @desc Register customer
exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Name, email, password required' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

  const user = await User.create({ name, email, password, phone });
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user, token: generateToken(user._id) },
  });
};

// @desc Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required' });

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid credentials' });

  if (!user.isActive)
    return res.status(403).json({ success: false, message: 'Account deactivated' });

  res.json({
    success: true,
    data: { user, token: generateToken(user._id) },
  });
};

// @desc Get current user profile
exports.getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// @desc Update profile
exports.updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, phone } = req.body;
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (req.file) user.avatar = `/uploads/${req.file.filename}`;
  await user.save();
  res.json({ success: true, data: user });
};

// @desc Change password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!(await user.matchPassword(currentPassword)))
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
};

// @desc Add address
exports.addAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  const { label, street, city, state, zip, country, isDefault } = req.body;
  if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  user.addresses.push({ label, street, city, state, zip, country, isDefault });
  await user.save();
  res.status(201).json({ success: true, data: user.addresses });
};

// @desc Update address
exports.updateAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  const addr = user.addresses.id(req.params.addressId);
  if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });
  const { label, street, city, state, zip, country, isDefault } = req.body;
  if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  Object.assign(addr, { label, street, city, state, zip, country, isDefault });
  await user.save();
  res.json({ success: true, data: user.addresses });
};

// @desc Delete address
exports.deleteAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
  await user.save();
  res.json({ success: true, data: user.addresses });
};

const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const { generateToken } = require("../middleware/authMiddleware");

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400); throw new Error("All fields are required");
  }
  if (password.length < 6) {
    res.status(400); throw new Error("Password must be at least 6 characters");
  }
  if (await User.findOne({ email: email.toLowerCase() })) {
    res.status(400); throw new Error("Email already registered");
  }
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
  });
  res.status(201).json({
    success: true,
    message: "Account created",
    token: generateToken(user._id),
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400); throw new Error("Email and password required");
  }
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401); throw new Error("Invalid email or password");
  }
  if (!user.isActive) {
    res.status(403); throw new Error("Your account is deactivated");
  }
  res.json({
    success: true,
    message: "Login successful",
    token: generateToken(user._id),
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) { res.status(404); throw new Error("User not found"); }
  res.json({ success: true, user });
});

// PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error("User not found"); }
  user.name  = req.body.name  || user.name;
  user.email = req.body.email || user.email;
  user.phone = req.body.phone || user.phone;
  if (req.body.address) {
    user.address = { ...(user.address || {}), ...req.body.address };
  }
  if (req.body.password) {
    if (req.body.password.length < 6) {
      res.status(400); throw new Error("Password min 6 characters");
    }
    user.password = req.body.password;
  }
  const updated = await user.save();
  res.json({
    success: true,
    message: "Profile updated",
    user: {
      _id: updated._id, name: updated.name,
      email: updated.email, role: updated.role,
      phone: updated.phone, address: updated.address,
    },
  });
});

module.exports = { register, login, getMe, updateProfile };

const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password").sort({ createdAt: -1 });
  res.json({ success: true, users, total: users.length });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) { res.status(404); throw new Error("User not found"); }
  res.json({ success: true, user });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error("User not found"); }
  user.name     = req.body.name     !== undefined ? req.body.name     : user.name;
  user.email    = req.body.email    !== undefined ? req.body.email    : user.email;
  user.role     = req.body.role     !== undefined ? req.body.role     : user.role;
  user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;
  const updated = await user.save();
  res.json({ success: true, message: "User updated", user: updated });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error("User not found"); }
  user.isActive = false;
  await user.save();
  res.json({ success: true, message: "User deactivated" });
});

const getAdminUserStats = asyncHandler(async (req, res) => {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [total, admins, newThisMonth] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: "admin", isActive: true }),
    User.countDocuments({ createdAt: { $gte: startOfMonth }, isActive: true }),
  ]);
  res.json({ success: true, stats: { total, admins, newThisMonth } });
});

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, getAdminUserStats };

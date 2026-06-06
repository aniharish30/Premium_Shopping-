const jwt          = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User         = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401); throw new Error("No token provided");
  }
  try {
    const token   = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user || !req.user.isActive) {
      res.status(401); throw new Error("Account not found or inactive");
    }
    next();
  } catch (err) {
    res.status(401);
    throw new Error(err.message || "Not authorized");
  }
});

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  res.status(403); throw new Error("Admins only");
};

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });

module.exports = { protect, adminOnly, generateToken };

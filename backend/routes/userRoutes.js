const express = require("express");
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser, getAdminUserStats } = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect, adminOnly);
router.get("/",        getAllUsers);
router.get("/stats",   getAdminUserStats);
router.get("/:id",     getUserById);
router.put("/:id",     updateUser);
router.delete("/:id",  deleteUser);

module.exports = router;

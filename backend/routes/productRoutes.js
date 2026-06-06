const express = require("express");
const router = express.Router();
const {
  getProducts, getCategories, getAdminStats,
  getProductById, createProduct, updateProduct, deleteProduct, addReview
} = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// public — no auth needed
router.get("/",                    getProducts);
router.get("/categories",          getCategories);
router.get("/admin/stats", protect, adminOnly, getAdminStats);
router.get("/:id",                 getProductById);

// protected
router.post("/",        protect, adminOnly, createProduct);
router.put("/:id",      protect, adminOnly, updateProduct);
router.delete("/:id",   protect, adminOnly, deleteProduct);
router.post("/:id/reviews", protect, addReview);

module.exports = router;

const express = require("express");
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/", getCart);
router.post("/add", addToCart);       // POST /api/cart/add
router.put("/update/:itemId", updateCartItem); // PUT /api/cart/update/:id
router.delete("/remove/:itemId", removeFromCart); // DELETE /api/cart/remove/:id
router.delete("/clear", clearCart);   // DELETE /api/cart/clear

module.exports = router;

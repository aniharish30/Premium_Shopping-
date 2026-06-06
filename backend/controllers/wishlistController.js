const asyncHandler = require("express-async-handler");
const Wishlist = require("../models/Wishlist");

const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate("products", "name images price rating stock isActive");
  // filter deleted products
  if (wishlist) {
    wishlist.products = wishlist.products.filter(p => p && p.isActive !== false);
  }
  res.json({ success: true, wishlist: wishlist || { products: [] } });
});

const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) { res.status(400); throw new Error("productId required"); }

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = new Wishlist({ user: req.user._id, products: [] });

  const idx = wishlist.products.indexOf(productId);
  const action = idx > -1 ? "removed" : "added";
  if (idx > -1) wishlist.products.splice(idx, 1);
  else wishlist.products.push(productId);

  await wishlist.save();
  const populated = await Wishlist.findById(wishlist._id)
    .populate("products", "name images price rating stock");

  res.json({ success: true, message: `${action} from wishlist`, action, wishlist: populated });
});

module.exports = { getWishlist, toggleWishlist };

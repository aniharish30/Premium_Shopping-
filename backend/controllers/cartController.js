const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const populateCart = (cart) =>
  Cart.findById(cart._id).populate("items.product", "name images price stock isActive");

const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate("items.product", "name images price stock isActive");

  if (cart) {
    // remove any items where product no longer exists
    const before = cart.items.length;
    cart.items = cart.items.filter(i => i.product && i.product.isActive !== false);
    if (cart.items.length !== before) await cart.save();
  }

  res.json({ success: true, cart: cart || { items: [] } });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) { res.status(400); throw new Error("productId required"); }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) { res.status(404); throw new Error("Product not found"); }
  if (product.stock < quantity) { res.status(400); throw new Error(`Only ${product.stock} in stock`); }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const idx = cart.items.findIndex(i => i.product?.toString() === productId);
  if (idx > -1) {
    const newQty = cart.items[idx].quantity + Number(quantity);
    if (newQty > product.stock) { res.status(400); throw new Error(`Max stock is ${product.stock}`); }
    cart.items[idx].quantity = newQty;
    cart.items[idx].price = product.price;
  } else {
    cart.items.push({ product: productId, quantity: Number(quantity), price: product.price });
  }

  await cart.save();
  res.json({ success: true, message: "Added to cart", cart: await populateCart(cart) });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) { res.status(404); throw new Error("Cart not found"); }

  const item = cart.items.find(i => i._id.toString() === req.params.itemId);
  if (!item) { res.status(404); throw new Error("Item not found in cart"); }

  if (Number(quantity) <= 0) {
    cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
  } else {
    item.quantity = Number(quantity);
  }
  await cart.save();
  res.json({ success: true, cart: await populateCart(cart) });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) { res.status(404); throw new Error("Cart not found"); }
  cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
  await cart.save();
  res.json({ success: true, cart: await populateCart(cart) });
});

const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }, { upsert: true });
  res.json({ success: true, message: "Cart cleared", cart: { items: [] } });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };

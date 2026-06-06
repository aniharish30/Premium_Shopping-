const asyncHandler = require("express-async-handler");
const Order   = require("../models/Order");
const Cart    = require("../models/Cart");
const Product = require("../models/Product");

// POST /api/orders
const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, notes } = req.body;

  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street) {
    res.status(400); throw new Error("Shipping address is required");
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    res.status(400); throw new Error("Your cart is empty");
  }

  // validate stock for every item
  for (const item of cart.items) {
    if (!item.product) { res.status(400); throw new Error("A product in your cart no longer exists"); }
    if (item.product.stock < item.quantity) {
      res.status(400); throw new Error(`Not enough stock for "${item.product.name}"`);
    }
  }

  const itemsPrice   = cart.items.reduce((t, i) => t + i.price * i.quantity, 0);
  const shippingPrice = itemsPrice >= 100 ? 0 : 9.99;
  const taxPrice     = itemsPrice * 0.1;
  const totalPrice   = itemsPrice + shippingPrice + taxPrice;

  const order = await Order.create({
    user: req.user._id,
    items: cart.items.map(i => ({
      product:  i.product._id,
      name:     i.product.name,
      image:    i.product.images?.[0] || "",
      price:    i.price,
      quantity: i.quantity,
    })),
    shippingAddress,
    paymentMethod: paymentMethod || "card",
    itemsPrice:    +itemsPrice.toFixed(2),
    shippingPrice: +shippingPrice.toFixed(2),
    taxPrice:      +taxPrice.toFixed(2),
    totalPrice:    +totalPrice.toFixed(2),
    notes: notes || "",
    isPaid: true,
    paidAt: new Date(),
    status: "processing",
    paymentResult: {
      id: `PAY-${Date.now()}`,
      status: "COMPLETED",
      updateTime: new Date().toISOString(),
      emailAddress: req.user.email,
    },
  });

  // decrement stock
  await Promise.all(
    cart.items.map(i =>
      Product.findByIdAndUpdate(i.product._id, { $inc: { stock: -i.quantity } })
    )
  );

  // clear the cart
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  res.status(201).json({ success: true, message: "Order placed!", order });
});

// GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) { res.status(404); throw new Error("Order not found"); }
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403); throw new Error("Not allowed to view this order");
  }
  res.json({ success: true, order });
});

// GET /api/orders/admin/all
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status && status !== "all" ? { status } : {};
  const pageNum = Math.max(Number(page), 1);
  const limitNum = Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(query),
  ]);

  res.json({ success: true, orders, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

// PUT /api/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(status)) { res.status(400); throw new Error("Invalid status"); }

  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error("Order not found"); }

  order.status = status;
  if (status === "delivered") { order.isDelivered = true; order.deliveredAt = new Date(); }
  await order.save();
  res.json({ success: true, message: "Order updated", order });
});

// GET /api/orders/admin/stats
const getAdminOrderStats = asyncHandler(async (req, res) => {
  const [totalOrders, pending, delivered, revenue] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: "pending" }),
    Order.countDocuments({ status: "delivered" }),
    Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
  ]);
  res.json({ success: true, stats: { totalOrders, pending, delivered, revenue: revenue[0]?.total || 0 } });
});

module.exports = { placeOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, getAdminOrderStats };

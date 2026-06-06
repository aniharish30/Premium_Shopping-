const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");

// GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, minPrice, maxPrice, sort, page = 1, limit = 12, featured } = req.query;

  const query = { isActive: true };

  if (keyword) {
    query.$or = [
      { name:        { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { brand:       { $regex: keyword, $options: "i" } },
      { tags:        { $in: [new RegExp(keyword, "i")] } },
    ];
  }
  if (category && category !== "all") query.category = category;
  if (featured === "true")            query.featured  = true;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    newest:     { createdAt: -1 },
    "price-low":  { price: 1 },
    "price-high": { price: -1 },
    rating:     { rating: -1 },
    popular:    { numReviews: -1 },
  };
  const sortBy = sortMap[sort] || { createdAt: -1 };

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Number(limit), 50);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortBy).skip(skip).limit(limitNum).lean(),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    products,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    total,
  });
});

// GET /api/products/categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct("category", { isActive: true });
  res.json({ success: true, categories });
});

// GET /api/products/admin/stats
const getAdminStats = asyncHandler(async (req, res) => {
  const [total, outOfStock, featured, categories] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true, stock: 0 }),
    Product.countDocuments({ isActive: true, featured: true }),
    Product.distinct("category", { isActive: true }),
  ]);
  res.json({ success: true, stats: { total, outOfStock, featured, categories: categories.length } });
});

// GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("reviews.user", "name");
  if (!product || !product.isActive) {
    res.status(404); throw new Error("Product not found");
  }
  res.json({ success: true, product });
});

// POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, originalPrice, category, brand, stock, images, featured, tags } = req.body;
  if (!name || !description || !price || !category) {
    res.status(400); throw new Error("name, description, price and category are required");
  }
  const product = await Product.create({
    name, description,
    price: Number(price),
    originalPrice: Number(originalPrice) || 0,
    category, brand: brand || "Generic",
    stock: Number(stock) || 0,
    images: Array.isArray(images) ? images : (images ? [images] : []),
    featured: featured === true || featured === "true",
    tags: Array.isArray(tags) ? tags : (tags ? tags.split(",").map(t => t.trim()) : []),
    isActive: true,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, message: "Product created", product });
});

// PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error("Product not found"); }

  const fields = ["name","description","price","originalPrice","category","brand","stock","images","featured","tags","isActive"];
  fields.forEach(f => { if (req.body[f] !== undefined) product[f] = req.body[f]; });
  if (req.body.price)         product.price         = Number(req.body.price);
  if (req.body.originalPrice) product.originalPrice = Number(req.body.originalPrice);
  if (req.body.stock)         product.stock         = Number(req.body.stock);

  const updated = await product.save();
  res.json({ success: true, message: "Product updated", product: updated });
});

// DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error("Product not found"); }
  product.isActive = false;
  await product.save();
  res.json({ success: true, message: "Product removed" });
});

// POST /api/products/:id/reviews
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || !comment) { res.status(400); throw new Error("rating and comment required"); }

  const product = await Product.findById(req.params.id);
  if (!product || !product.isActive) { res.status(404); throw new Error("Product not found"); }

  const alreadyReviewed = product.reviews.find(
    r => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) { res.status(400); throw new Error("You already reviewed this product"); }

  product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
  await product.save();

  res.status(201).json({ success: true, message: "Review added" });
});

module.exports = { getProducts, getCategories, getAdminStats, getProductById, createProduct, updateProduct, deleteProduct, addReview };

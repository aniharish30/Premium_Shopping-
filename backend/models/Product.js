const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name:    { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  description:   { type: String, required: true },
  price:         { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: 0 },
  category: {
    type: String, required: true,
    enum: ["Electronics","Fashion","Home & Garden","Sports","Accessories","Books","Beauty","Toys","Other"],
  },
  brand:      { type: String, default: "Generic" },
  stock:      { type: Number, default: 0, min: 0 },
  images:     [{ type: String }],
  rating:     { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  reviews:    [reviewSchema],
  featured:   { type: Boolean, default: false },
  tags:       [String],
  isActive:   { type: Boolean, default: true },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

productSchema.index({ name: "text", description: "text", brand: "text" });

module.exports = mongoose.model("Product", productSchema);

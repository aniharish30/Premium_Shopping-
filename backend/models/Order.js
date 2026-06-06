const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name:     String,
  image:    String,
  price:    Number,
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: String, street: String, city: String,
    state: String, zipCode: String, country: { type: String, default: "US" }, phone: String,
  },
  paymentMethod: { type: String, default: "card" },
  paymentResult: { id: String, status: String, updateTime: String, emailAddress: String },
  itemsPrice:    { type: Number, required: true },
  shippingPrice: { type: Number, default: 0 },
  taxPrice:      { type: Number, default: 0 },
  totalPrice:    { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending","processing","shipped","delivered","cancelled"],
    default: "pending",
  },
  isPaid:       { type: Boolean, default: false },
  paidAt:       Date,
  isDelivered:  { type: Boolean, default: false },
  deliveredAt:  Date,
  notes:        String,
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);

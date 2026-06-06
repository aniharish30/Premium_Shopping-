const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role:     { type: String, enum: ["user","admin"], default: "user" },
  avatar:   { type: String, default: "" },
  phone:    { type: String, default: "" },
  address: {
    street: { type: String, default: "" },
    city:   { type: String, default: "" },
    state:  { type: String, default: "" },
    zipCode:{ type: String, default: "" },
    country:{ type: String, default: "US" },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);

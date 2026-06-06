const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
dotenv.config();

const User = require("../models/User");
const Product = require("../models/Product");

const sampleUsers = [
  {
    name: "Admin User",
    email: "admin@shopverse.com",
    password: bcrypt.hashSync("admin123", 10),
    role: "admin",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: bcrypt.hashSync("user123", 10),
    role: "user",
  },
];

const sampleProducts = [
  {
    name: "Premium Wireless Headphones",
    description: "Studio-quality sound with active noise cancellation. 30-hour battery life, foldable design with premium carrying case. Perfect for work and travel.",
    price: 299.99, originalPrice: 399.99, category: "Electronics", brand: "SoundPro",
    stock: 50, rating: 4.5, numReviews: 128, featured: true, tags: ["wireless","headphones","audio"],
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"],
  },
  {
    name: "Minimalist Leather Watch",
    description: "Slim profile Swiss movement watch with genuine Italian leather strap. Water-resistant to 50m. Comes with a 2-year manufacturer warranty.",
    price: 189.99, originalPrice: 249.99, category: "Fashion", brand: "ChronoElite",
    stock: 30, rating: 4.7, numReviews: 89, featured: true, tags: ["watch","leather","minimalist"],
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"],
  },
  {
    name: "Smart Fitness Tracker",
    description: "Track your health 24/7 with heart rate, SpO2, sleep monitoring, and 100+ workout modes. 7-day battery life with GPS tracking.",
    price: 149.99, originalPrice: 199.99, category: "Electronics", brand: "FitTech",
    stock: 75, rating: 4.3, numReviews: 215, featured: false, tags: ["fitness","smartwatch","health"],
    images: ["https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500"],
  },
  {
    name: "Organic Cotton Tote Bag",
    description: "Eco-friendly, durable tote made from 100% organic cotton. Reinforced handles, large capacity with interior pocket. Machine washable.",
    price: 34.99, originalPrice: 44.99, category: "Accessories", brand: "EcoLife",
    stock: 120, rating: 4.6, numReviews: 67, featured: false, tags: ["eco","bag","organic"],
    images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=500"],
  },
  {
    name: "Mechanical Gaming Keyboard",
    description: "Full RGB mechanical keyboard with Cherry MX switches. N-key rollover, aluminum frame, detachable USB-C cable. Built for serious gamers.",
    price: 129.99, originalPrice: 179.99, category: "Electronics", brand: "GameForce",
    stock: 45, rating: 4.8, numReviews: 342, featured: true, tags: ["gaming","keyboard","mechanical"],
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"],
  },
  {
    name: "Scented Soy Candle Set",
    description: "Set of 3 hand-poured soy wax candles with essential oil scents: Lavender, Cedar & Sage, and Vanilla Amber. 40-hour burn time each.",
    price: 49.99, originalPrice: 64.99, category: "Home & Garden", brand: "AromaBliss",
    stock: 80, rating: 4.4, numReviews: 156, featured: false, tags: ["candle","home","aromatherapy"],
    images: ["https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=500"],
  },
  {
    name: "4K Action Camera",
    description: "Waterproof 4K/60fps action camera with image stabilization, wide-angle lens, and 2-inch touch display. Includes mounting accessories kit.",
    price: 249.99, originalPrice: 329.99, category: "Electronics", brand: "AdventureShot",
    stock: 25, rating: 4.5, numReviews: 198, featured: true, tags: ["camera","4k","waterproof"],
    images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500"],
  },
  {
    name: "Bamboo Cutting Board Set",
    description: "Set of 3 premium bamboo cutting boards in different sizes. Antimicrobial surface, juice grooves, and non-slip rubber feet. Dishwasher safe.",
    price: 39.99, originalPrice: 54.99, category: "Home & Garden", brand: "KitchenCraft",
    stock: 60, rating: 4.2, numReviews: 89, featured: false, tags: ["kitchen","bamboo","cutting board"],
    images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500"],
  },
  {
    name: "Running Shoes Pro",
    description: "Lightweight responsive running shoes with advanced foam technology. Breathable mesh upper, heel drop 8mm, suitable for road and light trail.",
    price: 119.99, originalPrice: 149.99, category: "Sports", brand: "SpeedRun",
    stock: 90, rating: 4.6, numReviews: 274, featured: false, tags: ["running","shoes","sports"],
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"],
  },
  {
    name: "Portable Coffee Maker",
    description: "USB-C rechargeable portable espresso maker. Compatible with ground coffee and pods. Makes perfect espresso anywhere. 80ml capacity, 20 bar pressure.",
    price: 79.99, originalPrice: 99.99, category: "Home & Garden", brand: "BrewGo",
    stock: 55, rating: 4.1, numReviews: 112, featured: false, tags: ["coffee","portable","espresso"],
    images: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500"],
  },
  {
    name: "Silk Sleep Mask",
    description: "100% natural mulberry silk sleep mask. Blocks 100% light, gentle on sensitive skin. Adjustable strap fits all head sizes. Includes travel pouch.",
    price: 24.99, originalPrice: 34.99, category: "Fashion", brand: "SilkDream",
    stock: 150, rating: 4.5, numReviews: 203, featured: false, tags: ["sleep","silk","wellness"],
    images: ["https://images.unsplash.com/photo-1586105449897-20b5efeb3233?w=500"],
  },
  {
    name: "Wireless Charging Pad",
    description: "15W fast wireless charging pad compatible with all Qi-enabled devices. Slim profile with LED indicator, includes 5A adapter. Charges through cases.",
    price: 39.99, originalPrice: 59.99, category: "Electronics", brand: "ChargeFast",
    stock: 110, rating: 4.3, numReviews: 178, featured: false, tags: ["wireless","charging","accessories"],
    images: ["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500"],
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log("✅ Connected to MongoDB for seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log("🗑  Cleared existing data");

    const createdUsers = await User.insertMany(sampleUsers);
    const adminId = createdUsers[0]._id;

    const productsWithUser = sampleProducts.map((p) => ({
      ...p,
      createdBy: adminId,
      isActive: true,
    }));
    await Product.insertMany(productsWithUser);

    console.log("\n✅ Database seeded successfully!");
    console.log(`   ${sampleProducts.length} products created`);
    console.log(`   ${sampleUsers.length} users created`);
    console.log("\n📧 Admin: admin@shopverse.com  | Password: admin123");
    console.log("📧 User:  jane@example.com     | Password: user123\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
};

seedDB();

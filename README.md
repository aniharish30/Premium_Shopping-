# ShopVerse — MERN E-Commerce Platform

A full-stack, production-grade e-commerce web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Features a dark-themed, modern UI, complete authentication, admin dashboard, and all core shopping features.

---

## 🚀 Tech Stack

### Frontend
- **React 18** with Vite (lightning-fast HMR)
- **React Router DOM v6** — client-side routing & protected routes
- **Axios** — HTTP client with interceptors
- **Context API** — Auth, Cart, Wishlist state management
- **Custom CSS** — Dark theme design system with CSS variables

### Backend
- **Node.js + Express.js** — REST API server
- **MongoDB + Mongoose** — NoSQL database & ODM
- **JWT** — Stateless authentication
- **bcryptjs** — Password hashing
- **Multer** — Image file uploads
- **CORS** — Cross-origin resource sharing

---

## 📁 Project Structure

```
shopverse/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── seed.js            # Database seeder
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── wishlistController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT protect + adminOnly + generateToken
│   │   └── errorMiddleware.js # notFound + errorHandler
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Cart.js
│   │   └── Wishlist.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── wishlistRoutes.js
│   │   ├── userRoutes.js
│   │   └── uploadRoutes.js
│   ├── uploads/               # Uploaded images stored here
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── ProductCard.jsx + .css
    │   │   │   └── Toast.jsx + .css
    │   │   └── layout/
    │   │       ├── Navbar.jsx + .css
    │   │       └── Footer.jsx + .css
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Auth state + login/register/logout
    │   │   ├── CartContext.jsx   # Cart state + CRUD operations
    │   │   └── WishlistContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx         # Hero + categories + featured products
    │   │   ├── Products.jsx     # Listing + filters + search + pagination
    │   │   ├── ProductDetail.jsx # Images + qty + reviews + wishlist
    │   │   ├── Cart.jsx         # Cart items + summary + update/remove
    │   │   ├── Checkout.jsx     # 3-step: shipping > payment > review
    │   │   ├── OrderSuccess.jsx
    │   │   ├── Orders.jsx       # Order history
    │   │   ├── OrderDetail.jsx  # Order status tracker
    │   │   ├── Wishlist.jsx
    │   │   ├── Profile.jsx      # Update info + change password
    │   │   ├── Login.jsx        # With demo account quick-fill
    │   │   ├── Register.jsx
    │   │   └── admin/
    │   │       ├── Dashboard.jsx  # Stats + recent orders
    │   │       ├── Products.jsx   # CRUD product list
    │   │       ├── ProductForm.jsx # Create/Edit product + image upload
    │   │       ├── Orders.jsx     # All orders + status update
    │   │       └── Users.jsx      # User management + role toggle
    │   ├── utils/
    │   │   └── api.js            # Axios instance with interceptors
    │   ├── styles/
    │   │   └── globals.css       # Design system, variables, utilities
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone and install

```bash
git clone https://github.com/yourusername/shopverse.git
cd shopverse

# Install all dependencies
npm run install:all
```

### 2. Configure environment

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce_db
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=30d
NODE_ENV=development
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed the database

```bash
npm run seed
```

This creates:
- **Admin**: `admin@shopverse.com` / `admin123`
- **User**: `jane@example.com` / `user123`
- **12 sample products** across 5 categories

### 4. Run development servers

```bash
npm run dev
```

Opens:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 🔌 API Reference

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login + get JWT |
| GET | `/api/auth/me` | Private | Get current user |
| PUT | `/api/auth/profile` | Private | Update profile |
| GET | `/api/products` | Public | List products (search/filter/paginate) |
| GET | `/api/products/:id` | Public | Product details |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| POST | `/api/products/:id/reviews` | Private | Add review |
| GET | `/api/cart` | Private | Get cart |
| POST | `/api/cart` | Private | Add to cart |
| PUT | `/api/cart/:itemId` | Private | Update quantity |
| DELETE | `/api/cart/:itemId` | Private | Remove item |
| POST | `/api/orders` | Private | Place order |
| GET | `/api/orders/my` | Private | My orders |
| GET | `/api/orders/:id` | Private | Order detail |
| GET | `/api/orders/admin/all` | Admin | All orders |
| PUT | `/api/orders/:id/status` | Admin | Update status |
| GET | `/api/wishlist` | Private | Get wishlist |
| POST | `/api/wishlist/toggle` | Private | Toggle item |
| GET | `/api/users` | Admin | All users |
| PUT | `/api/users/:id` | Admin | Update user/role |
| POST | `/api/upload` | Admin | Upload image |

---

## ✨ Features

### User Features
- Register / Login with JWT tokens
- Browse products with search, category filters, sort, price range
- Product detail with image gallery, reviews, star ratings
- Add/remove from cart, update quantities
- Wishlist toggle
- 3-step checkout (shipping → payment → review)
- Order history with status tracking
- Profile management & password change

### Admin Features
- Dashboard with live stats (revenue, orders, users, products)
- Full product CRUD with image upload
- Order management with status updates
- User management with role control

### Technical Highlights
- JWT authentication with auto-refresh on 401
- Role-based route protection (user & admin)
- Axios interceptors for global auth & error handling
- Context API for reactive cart/wishlist/auth state
- Responsive dark-themed UI with CSS variables
- Vite proxy for zero-config local API calls
- MongoDB indexes for text search
- Express async error handling middleware
- Multer image upload with file validation
- Database seeder for demo data

---

## 🎨 Design System

The app uses a custom dark design system defined in `globals.css`:

```css
--bg: #0d0d0f          /* Page background */
--accent: #c8a96e      /* Gold accent color */
--text: #f2f0eb        /* Primary text */
--font-display: 'Playfair Display'   /* Headings */
--font-body: 'DM Sans'               /* Body text */
```

---

## 📝 Interview Concepts Demonstrated

| Concept | Where |
|---------|-------|
| `useState`, `useEffect` | Every page component |
| `useContext` | Auth, Cart, Wishlist hooks |
| `useCallback` | CartContext fetch optimization |
| Protected Routes | `ProtectedRoute`, `AdminRoute` in App.jsx |
| JWT Auth | authMiddleware.js + AuthContext.jsx |
| REST API Design | All route files |
| Mongoose ODM | All model files |
| Middleware | authMiddleware, errorMiddleware |
| Async/Await | All controllers |
| Axios Interceptors | utils/api.js |
| Role-Based Access | `adminOnly` middleware |
| Error Handling | errorMiddleware + try/catch |
| Environment Variables | .env files |
| Responsive Design | CSS media queries |

---

## 📄 License

MIT — free to use for learning and portfolio projects.

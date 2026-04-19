# 🛍️ MyStore — MERN Personal E-Commerce Platform

A full-stack single-owner e-commerce platform built with MongoDB, Express.js, React, and Node.js.

---

## 📐 Architecture

```
Client (React + Redux Toolkit)
        │
        │  REST API (JSON)
        ▼
Express.js Server (Node.js)
        │
        ├── JWT Auth Middleware
        ├── Role-Based Access Control (Admin / Customer)
        ├── Multer (Image Uploads)
        └── PDFKit (Invoice Generation)
        │
        ▼
MongoDB (Mongoose ODM)
  ├── Users
  ├── Products
  ├── Carts
  ├── Wishlists
  ├── Orders  (with item snapshots)
  └── Invoices
```

---

## 📁 Folder Structure

```
mern-store/
├── backend/
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js       # Register, login, profile, addresses
│   │   ├── productController.js    # CRUD products, reviews
│   │   ├── cartController.js       # Cart management
│   │   ├── wishlistController.js   # Wishlist toggle
│   │   ├── orderController.js      # Place order, invoice
│   │   └── adminController.js      # Dashboard, orders, customers
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT protect + adminOnly
│   │   └── uploadMiddleware.js     # Multer image upload
│   ├── models/
│   │   ├── User.js                 # User + address schema
│   │   ├── Product.js              # Product + review schema
│   │   ├── Cart.js                 # Cart + items schema
│   │   ├── Wishlist.js             # Wishlist schema
│   │   ├── Order.js                # Order + item snapshot schema
│   │   └── Invoice.js              # Invoice schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── wishlistRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── adminRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── invoiceGenerator.js     # PDFKit PDF generation
│   │   └── seed.js                 # Seed admin + products
│   ├── uploads/                    # Product images (auto-created)
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── app/
    │   │   └── store.js            # Redux store
    │   ├── components/
    │   │   ├── customer/
    │   │   │   └── ProductCard.jsx
    │   │   └── shared/
    │   │       ├── CustomerLayout.jsx
    │   │       ├── AdminLayout.jsx
    │   │       └── UI.jsx          # Spinner, Pagination, StatCard, etc.
    │   ├── features/
    │   │   ├── auth/authSlice.js
    │   │   ├── cart/cartSlice.js
    │   │   ├── wishlist/wishlistSlice.js
    │   │   ├── products/productSlice.js
    │   │   └── orders/orderSlice.js
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── LoginPage.jsx
    │   │   │   └── RegisterPage.jsx
    │   │   ├── customer/
    │   │   │   ├── HomePage.jsx
    │   │   │   ├── ProductsPage.jsx
    │   │   │   ├── ProductDetailPage.jsx
    │   │   │   ├── CartPage.jsx
    │   │   │   ├── WishlistPage.jsx
    │   │   │   ├── CheckoutPage.jsx
    │   │   │   ├── OrdersPage.jsx
    │   │   │   ├── OrderDetailPage.jsx
    │   │   │   └── ProfilePage.jsx
    │   │   └── admin/
    │   │       ├── AdminDashboard.jsx
    │   │       ├── AdminProducts.jsx
    │   │       ├── AdminProductForm.jsx
    │   │       ├── AdminOrders.jsx
    │   │       ├── AdminOrderDetail.jsx
    │   │       └── AdminCustomers.jsx
    │   ├── utils/
    │   │   ├── api.js              # Axios instance + interceptors
    │   │   └── helpers.js          # formatCurrency, formatDate, etc.
    │   ├── styles/
    │   │   └── index.css           # Tailwind + custom classes
    │   ├── App.js                  # Routes + protected routes
    │   └── index.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## 🚀 Setup Guide

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

---

### 1. Clone and Install

```bash
# Clone (or extract the zip)
cd mern-store

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern-store
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
NODE_ENV=development
UPLOAD_PATH=uploads
```

For frontend, create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@store.com | admin123 |
| Customer | alice@example.com | pass1234 |
| Customer | bob@example.com | pass1234 |

Plus 12 sample products across 5 categories.

---

### 4. Run the App

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm start
# App opens on http://localhost:3000
```

---

## 🔌 API Summary

### Auth  `/api/auth`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | — | Register customer |
| POST | `/login` | — | Login (returns JWT) |
| GET | `/me` | ✅ | Get current user |
| PUT | `/profile` | ✅ | Update profile |
| PUT | `/change-password` | ✅ | Change password |
| POST | `/address` | ✅ | Add address |
| PUT | `/address/:id` | ✅ | Update address |
| DELETE | `/address/:id` | ✅ | Delete address |

### Products  `/api/products`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | — | List products (search, filter, sort, paginate) |
| GET | `/categories` | — | Get all categories |
| GET | `/:id` | — | Get product by ID or slug |
| POST | `/` | Admin | Create product (multipart) |
| PUT | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Soft delete product |
| POST | `/:id/reviews` | ✅ | Add review |

### Cart  `/api/cart`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | Get cart |
| POST | `/` | ✅ | Add item |
| PUT | `/:itemId` | ✅ | Update quantity |
| DELETE | `/:itemId` | ✅ | Remove item |
| DELETE | `/clear` | ✅ | Clear cart |

### Wishlist  `/api/wishlist`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | Get wishlist |
| POST | `/toggle` | ✅ | Toggle product |
| DELETE | `/:productId` | ✅ | Remove product |

### Orders  `/api/orders`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✅ | Place order |
| GET | `/` | ✅ | My orders (paginated) |
| GET | `/:id` | ✅ | Order detail |
| PUT | `/:id/cancel` | ✅ | Cancel order |
| GET | `/:id/invoice` | ✅ | Invoice JSON |
| GET | `/:id/invoice/download` | ✅ | Invoice PDF |

### Admin  `/api/admin`  *(Admin only)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Stats, charts, top products, low stock |
| GET | `/orders` | All orders (filter, search, paginate) |
| GET | `/orders/:id` | Order detail |
| PUT | `/orders/:id/status` | Update order status |
| GET | `/orders/:id/invoice/download` | Invoice PDF |
| GET | `/customers` | All customers |
| PUT | `/customers/:id/toggle` | Activate/deactivate |

---

## 🗂️ MongoDB Schemas

### User
```
name, email, password (hashed), role (admin|customer),
phone, avatar, addresses[], isActive, timestamps
```

### Product
```
name, slug, description, shortDescription, price, discountPrice,
category, brand, images[], stock, sold, reviews[], rating,
numReviews, tags[], isActive, isFeatured, weight, dimensions, timestamps
```

### Cart
```
user (ref), items[{ product, name, image, price, quantity }],
totalPrice, totalItems, timestamps
```

### Wishlist
```
user (ref), products[] (ref), timestamps
```

### Order
```
orderNumber, user (ref), customerSnapshot{name,email,phone},
items[{ product, name, image, price, quantity, totalPrice }],  ← snapshot
shippingAddress{street,city,state,zip,country},
paymentMethod, paymentStatus, orderStatus,
statusHistory[{status, note, updatedAt}],
subtotal, shippingCharge, discount, totalAmount,
notes, invoiceGenerated, timestamps
```

### Invoice
```
invoiceNumber, order (ref), user (ref), issuedAt,
storeName, storeAddress, storeEmail,
customerName, customerEmail, customerAddress,
items[{name,price,quantity,total}],
subtotal, shippingCharge, discount, totalAmount,
paymentMethod, paymentStatus, notes, timestamps
```

---

## ✨ Features Checklist

### Admin
- [x] Secure admin login (JWT + role check)
- [x] Add / Edit / Delete products with image upload
- [x] Manage stock levels
- [x] View all orders with filters
- [x] Update order status with history tracking
- [x] Dashboard: revenue, orders, customers, products
- [x] Monthly sales area chart (Recharts)
- [x] Top-selling products list
- [x] Low-stock alert panel
- [x] Customer management (activate/deactivate)
- [x] Download invoice PDF for any order

### Customer
- [x] Register and login
- [x] Browse products with search, filter, sort, pagination
- [x] View product detail with gallery
- [x] Add to cart / update quantity / remove
- [x] Like / wishlist products
- [x] Checkout with saved or new address
- [x] Place order (COD / Online)
- [x] View order history with status
- [x] Cancel order (Placed/Confirmed only)
- [x] Download invoice PDF
- [x] Manage profile (name, phone, avatar)
- [x] Change password
- [x] Add / edit / delete addresses

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Redux Toolkit, React Router v6 |
| Styling | Tailwind CSS, Plus Jakarta Sans + Syne fonts |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| File Upload | Multer |
| PDF | PDFKit |
| Notifications | react-hot-toast |

---

## 🔒 Security Notes

- Passwords are hashed with bcrypt (salt rounds: 12)
- JWT stored in localStorage (consider httpOnly cookies for production)
- Admin routes double-protected: `protect` + `adminOnly` middleware
- File uploads validated by MIME type and extension
- Soft deletes for products (isActive flag) preserve order history
- Order items stored as snapshots — price/name changes don't affect old orders

---

## 🧩 Extending the Project

- **Payment Gateway**: Integrate Razorpay/Stripe in CheckoutPage + a new `/api/payment` route
- **Email Notifications**: Add Nodemailer to send order confirmation emails
- **Reviews**: The review schema is ready — add a review section to ProductDetailPage
- **Coupons**: Add a Coupon model and apply discounts at checkout
- **Analytics**: Extend the dashboard with category-wise sales breakdown

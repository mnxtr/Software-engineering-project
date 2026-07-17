# NSU Cafeteria Management System

A full-stack MERN application for managing NSU (North South University) cafeteria operations.

## Features

### Customer Features
- User registration and login with JWT authentication
- Browse menu by categories
- Add items to cart with quantity management
- Place orders with balance or cash on delivery payment
- View order history and status
- Add balance to account

### Admin Features
- Dashboard to manage orders (update status)
- Menu management (add, edit, delete items)
- View all users and their balances

## Tech Stack

- **Frontend**: React 18, Vite, React Router
- **Backend**: Node.js, Express
- **Database**: SQLite (sqlite3)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Project Structure

```
nsu-cafeteria/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
└── server/             # Express backend
    ├── src/
    │   ├── config/
    │   ├── middleware/
    │   ├── models/
    │   ├── routes/
    │   └── index.js
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+ installed

### Installation

1. Install backend dependencies:
```bash
cd nsu-cafeteria/server
npm install
```

2. Install frontend dependencies:
```bash
cd ../client
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd nsu-cafeteria/server
npm run dev
```
Backend runs on http://localhost:5000

2. In a new terminal, start the frontend:
```bash
cd nsu-cafeteria/client
npm run dev
```
Frontend runs on http://localhost:3000

### Demo Accounts

The database is seeded with demo accounts on first run:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nsu.edu | admin123 |
| Student | student@nsu.edu | student123 |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/categories` - Get all categories
- `GET /api/menu/:id` - Get single menu item
- `POST /api/menu` - Create menu item (admin)
- `PUT /api/menu/:id` - Update menu item (admin)
- `DELETE /api/menu/:id` - Delete menu item (admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (admin)
- `POST /api/orders/:id/pay` - Pay for order

### Users
- `GET /api/users/balance` - Get user balance
- `POST /api/users/balance/add` - Add balance
- `GET /api/users` - Get all users (admin)

## Database Schema

### Users
- id, name, email, password, role, studentId, balance, createdAt

### Menu Items
- id, name, description, price, category, imageUrl, available, createdAt

### Orders
- id, userId, totalAmount, status, paymentMethod, paymentStatus, createdAt

### Order Items
- id, orderId, menuItemId, quantity, price

## Features for Software Engineering Project

1. **Authentication & Authorization** - JWT-based auth with role-based access
2. **CRUD Operations** - Full CRUD for menu items and orders
3. **State Management** - React Context for auth and cart state
4. **API Design** - RESTful API with proper status codes
5. **Database** - SQLite with relational schema
6. **Security** - Password hashing, token authentication
7. **Responsive UI** - Mobile-friendly design with CSS
8. **Error Handling** - Client and server-side validation

## Future Enhancements

- Add notification system (email/SMS)
- Order tracking with estimated time
- Inventory management
- Sales analytics dashboard
- Payment gateway integration
- Mobile app version
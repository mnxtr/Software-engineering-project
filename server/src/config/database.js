import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

const dbPath = process.env.SQLITE_DB_PATH || './cafeteria.db';
const db = new sqlite3.Database(dbPath);

export function initializeDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        studentId TEXT,
        balance REAL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        imageUrl TEXT,
        available INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        totalAmount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        paymentMethod TEXT,
        paymentStatus TEXT DEFAULT 'unpaid',
        token TEXT,
        estimatedMinutes INTEGER DEFAULT 15,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId INTEGER NOT NULL,
        menuItemId INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (orderId) REFERENCES orders(id),
        FOREIGN KEY (menuItemId) REFERENCES menu_items(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    seedData();
  });
}

function seedData() {
  const users = [
    ['Admin', 'admin@nsu.edu', 'admin123', 'admin', 'ADMIN001', 0],
    ['Demo Student', 'student@nsu.edu', 'student123', 'customer', 'STU001', 500],
    ['Main Cafeteria Vendor', 'vendor@nsu.edu', 'vendor123', 'vendor', 'VEND001', 0],
    ['Afsana Rahman', 'afsana.rahman@northsouth.edu', 'student123', 'customer', 'STU002', 820],
    ['Tanvir Hasan', 'tanvir.hasan@northsouth.edu', 'student123', 'customer', 'STU003', 260],
    ['Nadia Islam', 'nadia.islam@northsouth.edu', 'student123', 'customer', 'STU004', 1040],
    ['Cafeteria Supervisor', 'supervisor@nsu.edu', 'vendor123', 'vendor', 'VEND002', 0]
  ];

  users.forEach(([name, email, password, role, studentId, balance]) => {
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
      if (!row) {
        db.run(
          'INSERT INTO users (name, email, password, role, studentId, balance) VALUES (?, ?, ?, ?, ?, ?)',
          [name, email, bcrypt.hashSync(password, 10), role, studentId, balance]
        );
      }
    });
  });

  const menuItems = [
      ['Chicken Biriyani', 'Aromatic rice with tender chicken, egg, and salad', 180, 'Lunch', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8', 1],
      ['Beef Tehari', 'Spiced beef tehari with cucumber salad', 190, 'Lunch', 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a', 1],
      ['Khichuri Combo', 'Bhuna khichuri with chicken curry and pickle', 160, 'Lunch', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d', 1],
      ['Chicken Burger', 'Grilled chicken patty, lettuce, and house sauce', 200, 'Fast Food', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', 1],
      ['Cheese Pizza Slice', 'Oven-baked pizza slice with mozzarella', 120, 'Fast Food', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38', 1],
      ['Club Sandwich', 'Triple-layer chicken sandwich with fries', 150, 'Fast Food', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af', 1],
      ['French Fries', 'Crispy fries with garlic mayo dip', 100, 'Snacks', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877', 1],
      ['Chicken Roll', 'Paratha roll with chicken filling', 90, 'Snacks', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641', 1],
      ['Singara', 'Crispy potato-filled pastry', 25, 'Snacks', 'https://images.unsplash.com/photo-1601050690597-df0568f70950', 1],
      ['Paratha Set', 'Two parathas with vegetable curry', 120, 'Breakfast', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641', 1],
      ['Omelette Toast', 'Egg omelette with toasted bread', 95, 'Breakfast', 'https://images.unsplash.com/photo-1525351484163-7529414344d8', 1],
      ['Milk Tea', 'Traditional Bangladeshi milk tea', 40, 'Beverages', 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f', 1],
      ['Cold Coffee', 'Iced coffee with milk and chocolate drizzle', 110, 'Beverages', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', 1],
      ['Lemonade', 'Fresh lemon drink with mint', 70, 'Beverages', 'https://images.unsplash.com/photo-1527960471264-932f39eb5846', 1],
      ['Chocolate Brownie', 'Warm brownie with chocolate sauce', 130, 'Desserts', 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e', 1],
      ['Vanilla Ice Cream', 'Two scoops with chocolate topping', 90, 'Desserts', 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57', 1],
      ['Seasonal Fruit Cup', 'Mixed seasonal fruit bowl', 85, 'Desserts', 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea', 0]
    ];

  menuItems.forEach(item => {
    db.get('SELECT id FROM menu_items WHERE name = ?', [item[0]], (err, existing) => {
      if (!existing) {
        db.run(
          'INSERT INTO menu_items (name, description, price, category, imageUrl, available) VALUES (?, ?, ?, ?, ?, ?)',
          item
        );
      }
    });
  });

  setTimeout(seedOperationalData, 100);
}

function seedOperationalData() {
  db.get('SELECT id FROM orders LIMIT 1', (err, row) => {
    if (row) return;

    db.all('SELECT id, email FROM users', [], (usersErr, users) => {
      db.all('SELECT id, name, price FROM menu_items WHERE available = 1 ORDER BY id LIMIT 8', [], (itemsErr, items) => {
        if (usersErr || itemsErr || users.length === 0 || items.length < 4) return;

        const userByEmail = Object.fromEntries(users.map(user => [user.email, user]));
        const sampleOrders = [
          [userByEmail['student@nsu.edu']?.id, 360, 'pending', 'balance', 'paid', 'A1B2C3', 15, '-0 days'],
          [userByEmail['afsana.rahman@northsouth.edu']?.id, 290, 'preparing', 'cash', 'unpaid', 'D4E5F6', 10, '-0 days'],
          [userByEmail['tanvir.hasan@northsouth.edu']?.id, 240, 'ready', 'balance', 'paid', 'G7H8I9', 5, '-1 days'],
          [userByEmail['nadia.islam@northsouth.edu']?.id, 470, 'completed', 'balance', 'paid', 'J1K2L3', 0, '-2 days'],
          [userByEmail['student@nsu.edu']?.id, 210, 'cancelled', 'cash', 'unpaid', 'M4N5O6', 0, '-4 days']
        ];

        const orderStmt = db.prepare(`
          INSERT INTO orders (userId, totalAmount, status, paymentMethod, paymentStatus, token, estimatedMinutes, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, DATETIME('now', ?))
        `);

        sampleOrders.forEach(([userId, total, status, paymentMethod, paymentStatus, token, minutes, dateOffset]) => {
          if (!userId) return;
          orderStmt.run(userId, total, status, paymentMethod, paymentStatus, token, minutes, dateOffset, function() {
            seedOrderItems(this.lastID, items);
          });
        });
        orderStmt.finalize();

        const auditStmt = db.prepare('INSERT INTO audit_logs (userId, action, details) VALUES (?, ?, ?)');
        auditStmt.run(userByEmail['admin@nsu.edu']?.id, 'seed_database', 'Loaded dummy cafeteria users, menu, and orders');
        auditStmt.run(userByEmail['vendor@nsu.edu']?.id, 'update_order_status', 'Order #3 marked ready');
        auditStmt.run(userByEmail['student@nsu.edu']?.id, 'place_order', 'Demo order placed for test data');
        auditStmt.finalize();

        const notificationStmt = db.prepare('INSERT INTO notifications (userId, title, message, read) VALUES (?, ?, ?, ?)');
        notificationStmt.run(userByEmail['student@nsu.edu']?.id, 'Order received', 'Your cafeteria order is being prepared.', 0);
        notificationStmt.run(userByEmail['afsana.rahman@northsouth.edu']?.id, 'Pickup soon', 'Your order will be ready in about 10 minutes.', 0);
        notificationStmt.finalize();
      });
    });
  });
}

function seedOrderItems(orderId, items) {
  const stmt = db.prepare('INSERT INTO order_items (orderId, menuItemId, quantity, price) VALUES (?, ?, ?, ?)');
  stmt.run(orderId, items[0].id, 1, items[0].price);
  stmt.run(orderId, items[3].id, 1, items[3].price);
  stmt.finalize();
}

export default db;

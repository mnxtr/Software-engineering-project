# Unit Test Documentation

This branch adds backend tests for the NSU Companion cafeteria management API. The tests use Node's built-in test runner and a temporary SQLite database, so they do not modify the local development database.

## Run Tests

```bash
cd server
npm test
```

Expected result:

```text
# tests 7
# pass 7
# fail 0
```

## Test Data

The server seeds deterministic dummy data when the database starts:

- 7 users across admin, vendor, and customer roles
- 17 menu items across Breakfast, Lunch, Fast Food, Snacks, Beverages, and Desserts
- Sample orders across pending, preparing, ready, completed, and cancelled states
- Order items, audit logs, and notifications for dashboard testing

The seed is additive. Existing local records are preserved, and missing dummy records are inserted by unique fields such as user email and menu item name.

## Covered Features

| Feature area | Test coverage |
| --- | --- |
| Health | Confirms `/api/health` returns API status JSON |
| Auth | Registration, login, token creation, and `/api/auth/me` |
| Menu | Seeded menu data, `available=1` filtering, categories, admin create/update/delete |
| Users | Balance lookup, balance add, and admin user listing |
| Orders | Checkout, customer order lookup, order detail, payment, admin status update |
| Vendor | Role enforcement, order listing, dashboard stats, status update |
| Admin | Role enforcement, stats, audit log creation/listing, weekly revenue |

## Files

- `server/test/api.test.js`: API feature tests
- `server/src/app.js`: testable Express app factory
- `server/src/config/database.js`: configurable SQLite path and dummy seed data
- `server/src/routes/menu.js`: supports frontend-compatible `available=1` filtering

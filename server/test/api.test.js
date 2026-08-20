import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nsu-cafeteria-test-'));
process.env.SQLITE_DB_PATH = path.join(tmpDir, 'cafeteria.test.db');
process.env.JWT_SECRET = 'test-secret';

let server;
let baseUrl;
let db;
const tokens = {};

async function request(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  return { response, body };
}

async function login(email, password) {
  const { response, body } = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  assert.equal(response.status, 200);
  assert.ok(body.token);
  return body.token;
}

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

async function waitForSeed() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const { body } = await request('/api/menu?available=1');
    if (Array.isArray(body) && body.length >= 10) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Seed data did not become available in time');
}

before(async () => {
  const appModule = await import('../src/app.js');
  const dbModule = await import('../src/config/database.js');
  db = dbModule.default;
  const app = appModule.createApp();
  server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  await waitForSeed();
  tokens.admin = await login('admin@nsu.edu', 'admin123');
  tokens.student = await login('student@nsu.edu', 'student123');
  tokens.vendor = await login('vendor@nsu.edu', 'vendor123');
});

after(async () => {
  await new Promise(resolve => server.close(resolve));
  await new Promise(resolve => db.close(resolve));
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('health endpoint returns API status', async () => {
  const { response, body } = await request('/api/health');
  assert.equal(response.status, 200);
  assert.equal(body.status, 'ok');
});

test('auth supports registration, login, and current profile lookup', async () => {
  const email = `test-${Date.now()}@northsouth.edu`;
  const register = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test Student',
      email,
      password: 'student123',
      studentId: 'TEST001'
    })
  });
  assert.equal(register.response.status, 201);
  assert.equal(register.body.user.role, 'customer');

  const token = await login(email, 'student123');
  const me = await request('/api/auth/me', { headers: auth(token) });
  assert.equal(me.response.status, 200);
  assert.equal(me.body.email, email);
});

test('menu supports seeded data, available filtering, categories, and admin CRUD', async () => {
  const available = await request('/api/menu?available=1');
  assert.equal(available.response.status, 200);
  assert.ok(available.body.length >= 10);
  assert.ok(available.body.every(item => item.available === 1));

  const categories = await request('/api/menu/categories');
  assert.deepEqual(
    ['Beverages', 'Breakfast', 'Desserts', 'Fast Food', 'Lunch', 'Snacks'].every(category => categories.body.includes(category)),
    true
  );

  const create = await request('/api/menu', {
    method: 'POST',
    headers: auth(tokens.admin),
    body: JSON.stringify({
      name: 'Test Meal',
      description: 'Temporary test menu item',
      price: 123,
      category: 'Lunch',
      imageUrl: 'https://example.com/test.jpg'
    })
  });
  assert.equal(create.response.status, 201);

  const update = await request(`/api/menu/${create.body.id}`, {
    method: 'PUT',
    headers: auth(tokens.admin),
    body: JSON.stringify({
      name: 'Updated Test Meal',
      description: 'Updated description',
      price: 150,
      category: 'Lunch',
      imageUrl: 'https://example.com/updated.jpg',
      available: false
    })
  });
  assert.equal(update.response.status, 200);

  const remove = await request(`/api/menu/${create.body.id}`, {
    method: 'DELETE',
    headers: auth(tokens.admin)
  });
  assert.equal(remove.response.status, 200);
});

test('users can view and add balance while admin can list users', async () => {
  const beforeBalance = await request('/api/users/balance', { headers: auth(tokens.student) });
  assert.equal(beforeBalance.response.status, 200);

  const added = await request('/api/users/balance/add', {
    method: 'POST',
    headers: auth(tokens.student),
    body: JSON.stringify({ amount: 75 })
  });
  assert.equal(added.response.status, 200);
  assert.equal(added.body.balance, beforeBalance.body.balance + 75);

  const users = await request('/api/users', { headers: auth(tokens.admin) });
  assert.equal(users.response.status, 200);
  assert.ok(users.body.some(user => user.email === 'student@nsu.edu'));
});

test('orders support checkout, customer lookup, admin lookup, status updates, and payment', async () => {
  const menu = await request('/api/menu?available=1');
  const item = menu.body[0];

  const cashOrder = await request('/api/orders', {
    method: 'POST',
    headers: auth(tokens.student),
    body: JSON.stringify({
      items: [{ id: item.id, quantity: 1 }],
      paymentMethod: 'cash'
    })
  });
  assert.equal(cashOrder.response.status, 201);
  assert.equal(cashOrder.body.status, 'pending');
  assert.ok(cashOrder.body.token);

  const ownOrders = await request('/api/orders', { headers: auth(tokens.student) });
  assert.equal(ownOrders.response.status, 200);
  assert.ok(ownOrders.body.some(order => order.id === cashOrder.body.orderId));

  const orderDetail = await request(`/api/orders/${cashOrder.body.orderId}`, { headers: auth(tokens.student) });
  assert.equal(orderDetail.response.status, 200);
  assert.ok(orderDetail.body.items.length >= 1);

  const paid = await request(`/api/orders/${cashOrder.body.orderId}/pay`, {
    method: 'POST',
    headers: auth(tokens.student)
  });
  assert.equal(paid.response.status, 200);

  const status = await request(`/api/orders/${cashOrder.body.orderId}/status`, {
    method: 'PUT',
    headers: auth(tokens.admin),
    body: JSON.stringify({ status: 'ready' })
  });
  assert.equal(status.response.status, 200);

  const adminOrders = await request('/api/orders', { headers: auth(tokens.admin) });
  assert.equal(adminOrders.response.status, 200);
  assert.ok(adminOrders.body.some(order => order.id === cashOrder.body.orderId));
});

test('vendor endpoints enforce roles and expose order operations', async () => {
  const denied = await request('/api/vendor/orders', { headers: auth(tokens.student) });
  assert.equal(denied.response.status, 403);

  const orders = await request('/api/vendor/orders', { headers: auth(tokens.vendor) });
  assert.equal(orders.response.status, 200);
  assert.ok(Array.isArray(orders.body));

  const stats = await request('/api/vendor/stats', { headers: auth(tokens.vendor) });
  assert.equal(stats.response.status, 200);
  assert.ok(stats.body.totalOrders >= 1);

  const pendingOrder = orders.body.find(order => order.status !== 'completed') || orders.body[0];
  const update = await request(`/api/vendor/orders/${pendingOrder.id}/status`, {
    method: 'PUT',
    headers: auth(tokens.vendor),
    body: JSON.stringify({ status: 'preparing', estimatedMinutes: 8 })
  });
  assert.equal(update.response.status, 200);
});

test('admin endpoints expose stats, audit logs, and weekly revenue', async () => {
  const denied = await request('/api/admin/stats', { headers: auth(tokens.student) });
  assert.equal(denied.response.status, 403);

  const stats = await request('/api/admin/stats', { headers: auth(tokens.admin) });
  assert.equal(stats.response.status, 200);
  assert.ok(stats.body.totalUsers >= 7);
  assert.ok(stats.body.totalMenuItems >= 17);
  assert.ok(Array.isArray(stats.body.categoryDistribution));

  const createdLog = await request('/api/admin/audit-logs', {
    method: 'POST',
    headers: auth(tokens.admin),
    body: JSON.stringify({ action: 'test_audit', details: 'Created during API tests' })
  });
  assert.equal(createdLog.response.status, 201);

  const logs = await request('/api/admin/audit-logs', { headers: auth(tokens.admin) });
  assert.equal(logs.response.status, 200);
  assert.ok(logs.body.some(log => log.action === 'test_audit'));

  const revenue = await request('/api/admin/revenue-weekly', { headers: auth(tokens.admin) });
  assert.equal(revenue.response.status, 200);
  assert.ok(Array.isArray(revenue.body));
});

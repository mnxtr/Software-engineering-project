import express from 'express';
import db from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { category, available, q = '' } = req.query;
  const searchTerm = String(q).trim();

  let query = 'SELECT * FROM menu_items WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (available !== undefined) {
    const isAvailable = ['1', 'true', 'yes'].includes(String(available).toLowerCase());
    query += ' AND available = ?';
    params.push(isAvailable ? 1 : 0);
  }

  if (searchTerm) {
    query += ' AND (LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?) OR LOWER(category) LIKE LOWER(?))';
    const pattern = `%${searchTerm}%`;
    params.push(pattern, pattern, pattern);
  }

  query += ' ORDER BY category, name';

  db.all(query, params, (err, items) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch menu items' });
    }
    res.json(items);
  });
});

router.get('/categories', (req, res) => {
  db.all('SELECT DISTINCT category FROM menu_items ORDER BY category', [], (err, categories) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
    res.json(categories.map(({ category }) => category));
  });
});

router.get('/:id', (req, res) => {
  db.get('SELECT * FROM menu_items WHERE id = ?', [req.params.id], (err, item) => {
    if (err || !item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(item);
  });
});

router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const { name, description, price, category, imageUrl } = req.body;
  const numericPrice = Number(price);

  if (!name?.trim() || !category?.trim() || !Number.isFinite(numericPrice) || numericPrice <= 0) {
    return res.status(400).json({ error: 'Name, category, and a positive price are required' });
  }

  db.run(
    'INSERT INTO menu_items (name, description, price, category, imageUrl) VALUES (?, ?, ?, ?, ?)',
    [name.trim(), description?.trim() || '', numericPrice, category.trim(), imageUrl?.trim() || null],
    function onInsert(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add menu item' });
      }
      res.status(201).json({
        id: this.lastID,
        name: name.trim(),
        description: description?.trim() || '',
        price: numericPrice,
        category: category.trim(),
        imageUrl: imageUrl?.trim() || null,
      });
    },
  );
});

router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { name, description, price, category, imageUrl, available } = req.body;
  const numericPrice = Number(price);

  if (!name?.trim() || !category?.trim() || !Number.isFinite(numericPrice) || numericPrice <= 0) {
    return res.status(400).json({ error: 'Name, category, and a positive price are required' });
  }

  db.run(
    'UPDATE menu_items SET name = ?, description = ?, price = ?, category = ?, imageUrl = ?, available = ? WHERE id = ?',
    [
      name.trim(),
      description?.trim() || '',
      numericPrice,
      category.trim(),
      imageUrl?.trim() || null,
      available === false || available === 0 ? 0 : 1,
      req.params.id,
    ],
    function onUpdate(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update menu item' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      res.json({ message: 'Menu item updated successfully' });
    },
  );
});

router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  db.run('DELETE FROM menu_items WHERE id = ?', [req.params.id], function onDelete(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete menu item' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  });
});

export default router;

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    available: true
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      if (activeTab === 'orders') {
        const res = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setOrders(data);
      } else if (activeTab === 'menu') {
        const res = await fetch('/api/menu');
        const data = await res.json();
        setMenuItems(data);
      } else if (activeTab === 'users') {
        const res = await fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '', price: '', category: '', imageUrl: '', available: true });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl || '',
      available: item.available === 1
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = editingItem ? `/api/menu/${editingItem.id}` : '/api/menu';
    const method = editingItem ? 'PUT' : 'POST';

    try {
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save item:', err);
    }
  };

  const deleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-BD', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          Orders
        </button>
        <button className={`admin-tab ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
          Menu Items
        </button>
        <button className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          Users
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {activeTab === 'orders' && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center' }}>No orders found</td></tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.userName || `User #${order.userId}`}</td>
                      <td>{order.items?.length || 0} items</td>
                      <td>৳{order.totalAmount}</td>
                      <td>
                        <select
                          className="status-select"
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        {order.paymentStatus === 'unpaid' ? 'Unpaid' : 'Paid'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'menu' && (
            <>
              <button className="btn btn-primary" onClick={openAddModal} style={{ marginBottom: '20px' }}>
                Add New Item
              </button>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Available</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>৳{item.price}</td>
                      <td>{item.available ? 'Yes' : 'No'}</td>
                      <td>
                        <button className="btn btn-secondary" onClick={() => openEditModal(item)} style={{ marginRight: '10px' }}>
                          Edit
                        </button>
                        <button className="btn btn-outline" onClick={() => deleteItem(item.id)} style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {activeTab === 'users' && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Student ID</th>
                  <th>Role</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.studentId || '-'}</td>
                    <td>{u.role}</td>
                    <td>৳{u.balance?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" />
              </div>
              <div className="form-group">
                <label>Price (৳)</label>
                <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                  <option value="">Select category</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Fast Food">Fast Food</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Desserts">Desserts</option>
                </select>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" checked={formData.available} onChange={(e) => setFormData({ ...formData, available: e.target.checked })} />
                  {' '}Available
                </label>
              </div>
              <button type="submit" className="btn btn-primary">{editingItem ? 'Update' : 'Add'}</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ marginLeft: '10px' }}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
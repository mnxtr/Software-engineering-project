import { useEffect, useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  const fetchMenu = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/menu?available=true');
      if (!response.ok) throw new Error('The cafeteria menu is unavailable right now.');
      setMenuItems(await response.json());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/menu/categories');
      if (!response.ok) throw new Error('Failed to load menu categories.');
      setCategories(['All', ...await response.json()]);
    } catch (requestError) {
      setError(current => current || requestError.message);
    }
  };

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, []);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return menuItems.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const searchableText = [item.name, item.description, item.category].filter(Boolean).join(' ').toLowerCase();
      return matchesCategory && (!query || searchableText.includes(query));
    });
  }, [menuItems, searchTerm, selectedCategory]);

  if (loading) {
    return <div className="loading" role="status">Loading menu...</div>;
  }

  return (
    <main>
      <div className="page-header">
        <p className="eyebrow">Cafeteria services</p>
        <h1>Find your next meal</h1>
        <p>Search available items, compare categories, and add your choice to a pre-order.</p>
      </div>

      <section className="menu-toolbar" aria-label="Menu search and filters">
        <label className="menu-search">
          <span className="sr-only">Search the cafeteria menu</span>
          <input
            type="search"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            placeholder="Search by item, description, or category"
          />
        </label>

        <div className="menu-filters" aria-label="Filter menu by category">
          {categories.map(category => (
            <button
              key={category}
              type="button"
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
              aria-pressed={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="error-panel" role="alert">
          <p>{error}</p>
          <button type="button" className="btn btn-secondary" onClick={fetchMenu}>Try again</button>
        </div>
      )}

      {!error && (
        <p className="menu-results" aria-live="polite">
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} available
        </p>
      )}

      {!error && filteredItems.length === 0 ? (
        <div className="empty-state">
          <h2>No matching items</h2>
          <p>Try a different search term or select another category.</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="menu-grid">
          {filteredItems.map(item => (
            <article key={item.id} className="menu-card">
              <img
                src={item.imageUrl || 'https://via.placeholder.com/300x180?text=No+Image'}
                alt=""
                loading="lazy"
              />
              <div className="menu-card-content">
                <span className="category-label">{item.category}</span>
                <h2>{item.name}</h2>
                <p className="description">{item.description || 'No description provided.'}</p>
                <div className="menu-card-footer">
                  <span className="price">৳{Number(item.price).toFixed(2)}</span>
                  <button
                    type="button"
                    className="add-btn"
                    onClick={() => addToCart(item)}
                    aria-label={`Add ${item.name} to cart`}
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

/**
 * Shop.jsx — E-commerce product catalog with card layout and add-to-cart.
 * Shown to viewer role as a storefront experience.
 */
import { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { FiSearch, FiShoppingCart, FiBox, FiTag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const categoryIcons = {
  ELECTRONICS: '💻',
  CLOTHING: '👕',
  FOOD: '🍵',
  BOOKS: '📚',
  HOME: '🏠',
  SPORTS: '⚽',
  OTHER: '📦',
};

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const { addToCart, items } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get('/products?limit=100');
      setProducts(res.data.data || res.data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['ALL', ...new Set(products.map((p) => p.category).filter(Boolean))];

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'ALL' || p.category === category;
    return matchSearch && matchCat;
  });

  const getCartQty = (productId) => {
    const item = items.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  };

  const handleAdd = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Shop</h1>
      </div>

      {/* Search + Category filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
          ))}
        </select>
      </div>

      {/* Product cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FiBox size={48} className="mx-auto mb-3 opacity-50" />
          <p>No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product) => {
            const qty = getCartQty(product.id || product._id);
            return (
              <div
                key={product.id || product._id}
                className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Category banner */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 flex items-center justify-between">
                  <span className="text-white text-sm font-medium flex items-center gap-1.5">
                    <span className="text-base">{categoryIcons[product.category] || '📦'}</span>
                    {product.category}
                  </span>
                  <span className="text-white/80 text-xs font-mono">{product.sku}</span>
                </div>

                {/* Product info */}
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-slate-800 text-lg leading-tight group-hover:text-emerald-700 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{product.description}</p>

                  <div className="flex items-end justify-between pt-2">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Price</p>
                      <p className="text-2xl font-bold text-emerald-600">${Number(product.price).toFixed(2)}</p>
                    </div>

                    <button
                      onClick={() => handleAdd(product)}
                      className="relative inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors text-sm font-medium"
                    >
                      <FiShoppingCart size={16} />
                      Add
                      {qty > 0 && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {qty}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Shop;

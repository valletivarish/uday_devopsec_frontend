/**
 * Shop.jsx — E-commerce product catalog with stock availability,
 * add-to-cart with inline quantity controls, and compact card layout.
 * Fetches both products and inventory to display real stock levels.
 */
import { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { FiSearch, FiShoppingCart, FiPackage, FiStar, FiPlus, FiMinus } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const categoryColors = {
  ELECTRONICS: 'from-blue-600 to-indigo-700',
  CLOTHING: 'from-pink-600 to-rose-700',
  FOOD: 'from-orange-500 to-amber-600',
  BOOKS: 'from-violet-600 to-purple-700',
  HOME: 'from-cyan-600 to-teal-700',
  SPORTS: 'from-green-600 to-emerald-700',
  OTHER: 'from-slate-600 to-slate-700',
};

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const { addToCart, removeFromCart, updateQuantity, items } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, invRes] = await Promise.all([
        API.get('/products?limit=100'),
        API.get('/inventory?limit=100'),
      ]);

      const prods = prodRes.data.data || prodRes.data;
      const inventory = invRes.data.data || invRes.data;

      setProducts(prods);

      // Build a map of productId -> available stock
      const map = {};
      for (const inv of inventory) {
        const pid = inv.productId || inv.product?.id;
        if (pid) {
          map[pid] = Math.max(0, (inv.quantityInStock || 0) - (inv.quantityReserved || 0));
        }
      }
      setStockMap(map);
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

  const getStock = (productId) => {
    return stockMap[productId] ?? null;
  };

  const handleAdd = (product) => {
    const pid = product.id || product._id;
    const stock = getStock(pid);
    const currentQty = getCartQty(pid);
    if (stock !== null && currentQty >= stock) {
      toast.warning('Maximum available stock reached');
      return;
    }
    addToCart(product);
  };

  const handleIncrease = (product) => {
    const pid = product.id || product._id;
    const stock = getStock(pid);
    const currentQty = getCartQty(pid);
    if (stock !== null && currentQty >= stock) {
      toast.warning('Maximum available stock reached');
      return;
    }
    updateQuantity(pid, currentQty + 1);
  };

  const handleDecrease = (product) => {
    const pid = product.id || product._id;
    const currentQty = getCartQty(pid);
    if (currentQty <= 1) {
      removeFromCart(pid);
    } else {
      updateQuantity(pid, currentQty - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-xl p-5 text-white">
        <h1 className="text-2xl font-bold mb-1">Welcome to OPM Store</h1>
        <p className="text-emerald-200/70 text-xs max-w-xl">
          Browse our catalog and add items to your cart. Free shipping on orders over $100.
        </p>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-300/80">
            <FiPackage size={14} />
            <span>{products.length} Products</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-300/80">
            <FiStar size={14} />
            <span>{categories.length - 1} Categories</span>
          </div>
        </div>
      </div>

      {/* Search + Category filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                category === c
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
              }`}
            >
              {c === 'ALL' ? 'All' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Product cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FiPackage size={48} className="mx-auto mb-3 opacity-50" />
          <p>No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((product) => {
            const pid = product.id || product._id;
            const qty = getCartQty(pid);
            const stock = getStock(pid);
            const isOutOfStock = stock !== null && stock <= 0;
            const gradient = categoryColors[product.category] || categoryColors.OTHER;

            return (
              <div
                key={pid}
                className={`bg-white rounded-lg border overflow-hidden flex flex-col transition-all duration-200 ${
                  isOutOfStock
                    ? 'border-slate-200 opacity-75'
                    : 'border-slate-200 hover:shadow-md hover:border-emerald-200'
                }`}
              >
                {/* Product visual header — compact */}
                <div className={`bg-gradient-to-br ${gradient} p-3 flex items-center justify-center relative`}>
                  <FiPackage size={28} className="text-white/80" />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-bold bg-red-600 px-2 py-0.5 rounded">
                        OUT OF STOCK
                      </span>
                    </div>
                  )}
                </div>

                {/* Product info — compact */}
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-semibold text-slate-800 text-sm leading-tight line-clamp-1">
                    {product.name}
                  </h3>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                    {product.category}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 flex-1">
                    {product.description}
                  </p>

                  {/* Stock indicator */}
                  <div className="mt-2">
                    {stock !== null && !isOutOfStock && (
                      <span className={`text-[10px] font-medium ${
                        stock <= 10 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {stock <= 10 ? `Only ${stock} left` : `${stock} in stock`}
                      </span>
                    )}
                  </div>

                  {/* Price + Cart controls */}
                  <div className="flex items-end justify-between mt-1.5 gap-1">
                    <p className="text-lg font-bold text-slate-800">
                      ${Number(product.price).toFixed(2)}
                    </p>

                    {isOutOfStock ? (
                      <span className="text-[10px] text-red-500 font-medium">Unavailable</span>
                    ) : qty === 0 ? (
                      <button
                        onClick={() => handleAdd(product)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-emerald-700 transition-colors"
                      >
                        <FiShoppingCart size={12} />
                        Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDecrease(product)}
                          className="w-6 h-6 flex items-center justify-center rounded border border-slate-300 hover:bg-slate-100 text-slate-600"
                        >
                          <FiMinus size={11} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-800">
                          {qty}
                        </span>
                        <button
                          onClick={() => handleIncrease(product)}
                          disabled={stock !== null && qty >= stock}
                          className="w-6 h-6 flex items-center justify-center rounded border border-slate-300 hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <FiPlus size={11} />
                        </button>
                      </div>
                    )}
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

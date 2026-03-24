/**
 * Shop.jsx — E-commerce product catalog with card layout and add-to-cart.
 * Shown to viewer role as a storefront experience.
 */
import { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { FiSearch, FiShoppingCart, FiPackage, FiStar, FiCheck } from 'react-icons/fi';
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
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState(new Set());
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
    const pid = product.id || product._id;
    setAddedIds((prev) => new Set(prev).add(pid));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(pid);
        return next;
      });
    }, 1200);
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
      {/* Hero section */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to OPM Store</h1>
        <p className="text-emerald-200/70 text-sm max-w-xl">
          Browse our catalog and add items to your cart. Free shipping on orders over $500.
        </p>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm text-emerald-300/80">
            <FiPackage size={16} />
            <span>{products.length} Products</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-300/80">
            <FiStar size={16} />
            <span>{categories.length - 1} Categories</span>
          </div>
        </div>
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
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product) => {
            const pid = product.id || product._id;
            const qty = getCartQty(pid);
            const justAdded = addedIds.has(pid);
            const gradient = categoryColors[product.category] || categoryColors.OTHER;

            return (
              <div
                key={pid}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all duration-200 flex flex-col"
              >
                {/* Product visual header */}
                <div className={`bg-gradient-to-br ${gradient} p-6 flex items-center justify-center`}>
                  <FiPackage size={40} className="text-white/80" />
                </div>

                {/* Product info */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800 leading-tight">{product.name}</h3>
                  </div>
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    {product.category} | {product.sku}
                  </span>
                  <p className="text-xs text-slate-500 mb-4 flex-1 line-clamp-2">{product.description}</p>

                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      <p className="text-2xl font-bold text-slate-800">${Number(product.price).toFixed(2)}</p>
                    </div>

                    <button
                      onClick={() => handleAdd(product)}
                      className={`relative inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        justAdded
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : 'bg-slate-900 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {justAdded ? (
                        <>
                          <FiCheck size={16} />
                          Added
                        </>
                      ) : (
                        <>
                          <FiShoppingCart size={16} />
                          Add
                        </>
                      )}
                      {qty > 0 && !justAdded && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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

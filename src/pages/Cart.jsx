/**
 * Cart.jsx — Shopping cart page with item management and checkout.
 * Allows adjusting quantities, removing items, and placing an order.
 * No real payment — just creates the order via the API.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiCreditCard, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const [placing, setPlacing] = useState(false);

  const tax = totalPrice * 0.23; // 23% Irish VAT
  const shipping = totalPrice > 500 ? 0 : 9.99;
  const grandTotal = totalPrice + tax + shipping;

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setPlacing(true);
    try {
      // Get first customer as the buyer (viewer is the customer)
      const custRes = await API.get('/customers?limit=1');
      const customers = custRes.data.data || custRes.data;
      if (!customers || customers.length === 0) {
        toast.error('No customer profile found. Please contact admin.');
        return;
      }

      const payload = {
        customerId: customers[0].id || customers[0]._id,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      await API.post('/orders', payload);
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/my-orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Shopping Cart</h1>
        <div className="text-center py-20">
          <FiShoppingBag size={64} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 text-lg mb-2">Your cart is empty</p>
          <p className="text-slate-400 text-sm mb-6">Browse our shop and add some products!</p>
          <button
            onClick={() => navigate('/shop')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors text-sm font-medium"
          >
            <FiArrowLeft size={16} />
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Shopping Cart</h1>
        <span className="text-sm text-slate-500">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-white rounded-lg shadow-sm border border-emerald-100 p-4 flex items-center gap-4"
            >
              {/* Product icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                <FiShoppingBag className="text-emerald-600" size={24} />
              </div>

              {/* Product details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 truncate">{item.name}</h3>
                <p className="text-sm text-slate-400">{item.category}</p>
                <p className="text-emerald-600 font-bold">${item.price.toFixed(2)}</p>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                >
                  <FiMinus size={14} />
                </button>
                <span className="w-8 text-center font-semibold text-slate-800">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                >
                  <FiPlus size={14} />
                </button>
              </div>

              {/* Subtotal + remove */}
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-slate-800">${(item.price * item.quantity).toFixed(2)}</p>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="text-red-400 hover:text-red-600 mt-1"
                  title="Remove"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => navigate('/shop')}
            className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-800 font-medium mt-2"
          >
            <FiArrowLeft size={14} />
            Continue Shopping
          </button>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-5 sticky top-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (23% VAT)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-emerald-600">FREE</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              {totalPrice <= 500 && (
                <p className="text-xs text-slate-400">Free shipping on orders over $500</p>
              )}
              <hr className="border-emerald-100" />
              <div className="flex justify-between text-lg font-bold text-slate-800">
                <span>Total</span>
                <span className="text-emerald-600">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={placing}
              className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors text-sm font-semibold disabled:opacity-50"
            >
              <FiCreditCard size={18} />
              {placing ? 'Placing Order...' : 'Place Order'}
            </button>

            <p className="text-xs text-slate-400 text-center mt-3">
              No real payment required — demo mode
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

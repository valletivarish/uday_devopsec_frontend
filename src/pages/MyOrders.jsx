/**
 * MyOrders.jsx — Customer-facing order history with status tracking.
 * Shows the viewer's orders with status badges and detail view.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { FiEye, FiPackage } from 'react-icons/fi';
import StatusBadge from '../components/common/StatusBadge';

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders?limit=100');
      setOrders(res.data.data || res.data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <FiPackage size={64} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 text-lg mb-2">No orders yet</p>
          <p className="text-slate-400 text-sm">Start shopping to see your orders here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id || order._id}
              className="bg-white rounded-xl shadow-sm border border-emerald-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm font-semibold text-slate-700">
                      {order.orderNumber || `#${(order.id || order._id || '').toString().slice(-8)}`}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
                    <span>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </span>
                    <span>
                      {(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}
                    </span>
                    {order.customer && (
                      <span>{order.customer.firstName} {order.customer.lastName}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-emerald-600">
                    ${Number(order.totalAmount || 0).toFixed(2)}
                  </span>
                  <button
                    onClick={() => navigate(`/orders/${order.id || order._id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    <FiEye size={14} />
                    Details
                  </button>
                </div>
              </div>

              {/* Item preview */}
              {order.items && order.items.length > 0 && (
                <div className="mt-3 pt-3 border-t border-emerald-50 flex flex-wrap gap-2">
                  {order.items.slice(0, 4).map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full"
                    >
                      {item.productName || item.product?.name || 'Product'} x{item.quantity}
                    </span>
                  ))}
                  {order.items.length > 4 && (
                    <span className="text-xs text-slate-400 self-center">
                      +{order.items.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;

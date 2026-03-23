/**
 * OrderDetail.jsx - Single order detail view.
 * Shows order information, line items, a status timeline,
 * and action buttons for workflow transitions (Pay, Ship, Deliver, Cancel).
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { toast } from 'react-toastify';
import {
  FiArrowLeft,
  FiCreditCard,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';
import StatusBadge from '../components/common/StatusBadge';

/**
 * Ordered list of statuses used to render the status timeline.
 * Each status maps to a step in the order lifecycle.
 */
const STATUS_FLOW = ['PLACED', 'PAID', 'SHIPPED', 'DELIVERED'];

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  /** Fetch the single order by ID */
  const fetchOrder = async () => {
    try {
      const res = await API.get(`/orders/${id}`);
      setOrder(res.data.data || res.data);
    } catch (err) {
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Execute a workflow action on the order (pay, ship, deliver, or cancel).
   * Sends a POST to the appropriate endpoint and refreshes the order.
   */
  const handleAction = async (action, label) => {
    try {
      await API.post(`/orders/${id}/${action}`);
      toast.success(`Order ${label} successfully`);
      fetchOrder();
    } catch (err) {
      toast.error(
        err.response?.data?.message || `Failed to ${label.toLowerCase()} order`
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!order) return null;

  // Determine which step the order is currently at in the status flow
  const currentStepIndex = STATUS_FLOW.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="space-y-6">
      {/* Back button and page header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 rounded-lg hover:bg-slate-200 text-slate-600"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Order Details</h1>
          <p className="text-sm text-slate-500 font-mono">
            Order #{order.orderNumber || (order._id || order.id || '').toUpperCase()}
          </p>
        </div>
      </div>

      {/* Order overview card with status and customer info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main order info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status and basic info card */}
          <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Order Information
              </h2>
              <StatusBadge status={order.status} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Customer</span>
                <p className="font-medium text-slate-800">
                  {order.customer
                    ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || 'N/A'
                    : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Email</span>
                <p className="font-medium text-slate-800">
                  {order.customer?.email || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Order Date</span>
                <p className="font-medium text-slate-800">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Total Amount</span>
                <p className="text-xl font-bold text-emerald-600">
                  ${Number(order.totalAmount || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Order items table */}
          <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-5">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Order Items
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-emerald-50/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                      Price
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {(order.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-slate-700">
                        {item.product?.name || item.productName || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        ${Number(item.price || item.product?.price || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        $
                        {(
                          (item.price || item.product?.price || 0) *
                          item.quantity
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-emerald-100">
                    <td
                      colSpan={3}
                      className="px-4 py-3 text-right font-semibold text-slate-700"
                    >
                      Total:
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600 text-lg">
                      ${Number(order.totalAmount || 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Status timeline and action buttons */}
        <div className="space-y-6">
          {/* Status timeline card */}
          <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-5">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Status Timeline
            </h2>
            <div className="space-y-4">
              {STATUS_FLOW.map((status, idx) => {
                // Determine if this step is completed, current, or upcoming
                const isCompleted = !isCancelled && currentStepIndex >= idx;
                const isCurrent =
                  !isCancelled && currentStepIndex === idx;

                return (
                  <div key={status} className="flex items-center gap-3">
                    {/* Step indicator dot */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-400'
                      } ${isCurrent ? 'ring-2 ring-emerald-300' : ''}`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          isCompleted ? 'text-slate-800' : 'text-slate-400'
                        }`}
                      >
                        {status}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-emerald-600">Current</p>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Show cancelled status if applicable */}
              {isCancelled && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-red-600 text-white">
                    <FiXCircle size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      CANCELLED
                    </p>
                    <p className="text-xs text-red-400">Order was cancelled</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status history (if available from API) */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-5">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Status History
              </h2>
              <div className="space-y-3">
                {order.statusHistory.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm border-b border-emerald-100 pb-2"
                  >
                    <StatusBadge status={entry.status} />
                    <span className="text-slate-400 text-xs">
                      {entry.timestamp
                        ? new Date(entry.timestamp).toLocaleString()
                        : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons card - only show when order is not completed or cancelled */}
          {!isCancelled && order.status !== 'DELIVERED' && (
            <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-5">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Actions
              </h2>
              <div className="space-y-2">
                {/* Process Payment button - available when order is PLACED */}
                {order.status === 'PLACED' && (
                  <button
                    onClick={() =>
                      handleAction('process-payment', 'Payment processed')
                    }
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <FiCreditCard size={16} />
                    Process Payment
                  </button>
                )}

                {/* Ship button - available when order is PAID */}
                {order.status === 'PAID' && (
                  <button
                    onClick={() => handleAction('ship', 'Shipped')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    <FiTruck size={16} />
                    Ship Order
                  </button>
                )}

                {/* Deliver button - available when order is SHIPPED */}
                {order.status === 'SHIPPED' && (
                  <button
                    onClick={() => handleAction('deliver', 'Delivered')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <FiCheckCircle size={16} />
                    Mark as Delivered
                  </button>
                )}

                {/* Cancel button - available at any non-terminal state */}
                <button
                  onClick={() => handleAction('cancel', 'Cancelled')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  <FiXCircle size={16} />
                  Cancel Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

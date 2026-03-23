/**
 * Orders.jsx - Order management page with list view, status filtering, and order creation.
 * Displays a filterable, paginated table of orders. New orders can be created
 * by selecting a customer, adding products with quantities, and submitting.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { toast } from 'react-toastify';
import {
  FiPlus,
  FiEye,
  FiTrash2,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import DeleteConfirm from '../components/common/DeleteConfirm';
import StatusBadge from '../components/common/StatusBadge';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Create order form state
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState([
    { productId: '', quantity: 1 },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  /** Fetch orders, customers, and products in parallel */
  const fetchData = async () => {
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        API.get('/orders'),
        API.get('/customers'),
        API.get('/products'),
      ]);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  /** Apply search text and status filter to the orders list */
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.orderNumber || o._id || o.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customer?.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customer?.lastName || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  /** Add a new empty item row to the order creation form */
  const addItemRow = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1 }]);
  };

  /** Remove an item row from the order creation form */
  const removeItemRow = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  /** Update a specific field in an order item row */
  const updateItem = (index, field, value) => {
    const updated = [...orderItems];
    updated[index][field] = value;
    setOrderItems(updated);
  };

  /**
   * Calculate the total price for the current order being created.
   * Looks up each selected product's price and multiplies by quantity.
   */
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      const product = products.find(
        (p) => (p._id || p.id) === item.productId
      );
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  /** Submit the new order to the API */
  const handleCreateOrder = async (e) => {
    e.preventDefault();

    // Validate that at least one valid item is present
    const validItems = orderItems.filter((item) => item.productId && item.quantity > 0);
    if (!selectedCustomer || validItems.length === 0) {
      toast.error('Please select a customer and add at least one product');
      return;
    }

    try {
      const payload = {
        customerId: selectedCustomer,
        items: validItems.map((item) => ({
          productId: item.productId,
          quantity: parseInt(item.quantity, 10),
        })),
      };
      await API.post('/orders', payload);
      toast.success('Order created successfully');
      setModalOpen(false);
      setSelectedCustomer('');
      setOrderItems([{ productId: '', quantity: 1 }]);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    }
  };

  /** Delete the selected order */
  const handleDelete = async () => {
    try {
      await API.delete(`/orders/${deleteTarget._id || deleteTarget.id}`);
      toast.success('Order deleted successfully');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete order');
    }
  };

  // Column definitions for the orders table
  const columns = [
    {
      key: 'orderNumber',
      label: 'Order #',
      render: (row) => (
        <span className="font-mono text-xs text-slate-600">
          {row.orderNumber || (row._id || row.id || '').slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (row) =>
        row.customer
          ? `${row.customer.firstName || ''} ${row.customer.lastName || ''}`.trim() || 'N/A'
          : 'N/A',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'totalAmount',
      label: 'Total',
      render: (row) => (
        <span className="font-medium">
          ${Number(row.totalAmount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString()
          : 'N/A',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/orders/${row._id || row.id}`)}
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
            title="View order details"
          >
            <FiEye size={16} />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            title="Delete order"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  // All possible status values for the filter dropdown
  const statuses = ['ALL', 'PLACED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors text-sm font-medium"
        >
          <FiPlus size={18} />
          Create Order
        </button>
      </div>

      {/* Search and status filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by order number or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          />
        </div>
        {/* Status filter dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s === 'ALL' ? 'All Statuses' : s}
            </option>
          ))}
        </select>
      </div>

      {/* Orders data table */}
      <Table columns={columns} data={filteredOrders} />

      {/* Create order modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Order"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          {/* Customer selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Customer *
            </label>
            <select
              required
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              <option value="">Select a customer</option>
              {customers.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.firstName} {c.lastName} ({c.email})
                </option>
              ))}
            </select>
          </div>

          {/* Order items - each row allows selecting a product and quantity */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Order Items *
            </label>
            <div className="space-y-2">
              {orderItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p._id || p.id} value={p._id || p.id}>
                        {p.name} (${Number(p.price).toFixed(2)})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                    className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="Qty"
                  />
                  {/* Allow removing rows if more than one exists */}
                  {orderItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <FiX size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItemRow}
              className="mt-2 text-sm text-emerald-600 hover:text-emerald-800 font-medium"
            >
              + Add Another Item
            </button>
          </div>

          {/* Auto-calculated order total */}
          <div className="bg-emerald-50/50 rounded-lg p-3 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">
              Estimated Total:
            </span>
            <span className="text-lg font-bold text-slate-800">
              ${calculateTotal().toFixed(2)}
            </span>
          </div>

          {/* Form action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700"
            >
              Create Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation dialog */}
      <DeleteConfirm
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={`Order #${deleteTarget?.orderNumber || (deleteTarget?._id || deleteTarget?.id || '').slice(-8).toUpperCase()}`}
      />
    </div>
  );
};

export default Orders;

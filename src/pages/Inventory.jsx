/**
 * Inventory.jsx - Inventory management page with stock levels and restocking.
 * Displays a searchable, paginated table of inventory items with
 * create, edit (restock), and delete functionality.
 */
import { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiAlertTriangle,
} from 'react-icons/fi';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import DeleteConfirm from '../components/common/DeleteConfirm';
import { useAuth } from '../hooks/useAuth';

const Inventory = () => {
  const { canCreate, canEdit, canDelete } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form fields for create/edit inventory
  const [form, setForm] = useState({
    productId: '',
    quantityInStock: '',
    warehouseLocation: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  /** Fetch inventory items and products in parallel */
  const fetchData = async () => {
    try {
      const [invRes, prodRes] = await Promise.all([
        API.get('/inventory?limit=100'),
        API.get('/products?limit=100'),
      ]);
      setInventory(invRes.data.data || invRes.data);
      setProducts(prodRes.data.data || prodRes.data);
    } catch (err) {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  /** Filter inventory by product name or location */
  const filteredInventory = inventory.filter(
    (item) =>
      (item.product?.name || item.productName || '')
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (item.warehouseLocation || '').toLowerCase().includes(search.toLowerCase())
  );

  /** Validate inventory form */
  const validateForm = () => {
    const errs = {};
    if (!form.productId) errs.productId = 'Product is required';
    if (form.quantityInStock === '' || parseInt(form.quantityInStock, 10) < 0) errs.quantityInStock = 'Quantity must be 0 or more';
    return errs;
  };

  /** Open modal for adding a new inventory record */
  const handleCreate = () => {
    setEditing(null);
    setForm({ productId: '', quantityInStock: '', warehouseLocation: '' });
    setErrors({});
    setModalOpen(true);
  };

  /** Open modal for editing/restocking an existing inventory item */
  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      productId: item.product?._id || item.product?.id || item.productId || '',
      quantityInStock: item.quantityInStock || '',
      warehouseLocation: item.warehouseLocation || '',
    });
    setErrors({});
    setModalOpen(true);
  };

  /** Submit create or update form */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    try {
      const payload = {
        productId: form.productId,
        quantityInStock: parseInt(form.quantityInStock, 10),
        warehouseLocation: form.warehouseLocation,
      };
      if (editing) {
        await API.put(`/inventory/${editing._id || editing.id}`, payload);
        toast.success('Inventory updated successfully');
      } else {
        await API.post('/inventory', payload);
        toast.success('Inventory record created successfully');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  /** Delete the selected inventory record */
  const handleDelete = async () => {
    try {
      await API.delete(`/inventory/${deleteTarget._id || deleteTarget.id}`);
      toast.success('Inventory record deleted');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete inventory record');
    }
  };

  /**
   * Returns a color-coded stock level indicator.
   * Red for low stock (<10), yellow for medium (<30), green for healthy.
   */
  const getStockLevelStyle = (qty) => {
    if (qty < 10) return 'text-red-600 bg-red-50';
    if (qty < 30) return 'text-yellow-700 bg-yellow-50';
    return 'text-green-700 bg-green-50';
  };

  // Column definitions for the inventory table
  const columns = [
    {
      key: 'product',
      label: 'Product',
      render: (row) => (
        <span className="font-medium">
          {row.product?.name || row.productName || 'N/A'}
        </span>
      ),
    },
    {
      key: 'quantityInStock',
      label: 'Stock Level',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStockLevelStyle(
              row.quantityInStock
            )}`}
          >
            {row.quantityInStock} units
          </span>
          {/* Show warning icon for low stock items */}
          {row.quantityInStock < 10 && (
            <FiAlertTriangle className="text-red-500" size={14} />
          )}
        </div>
      ),
    },
    {
      key: 'warehouseLocation',
      label: 'Location',
      render: (row) => (
        <span className="text-slate-500">{row.warehouseLocation || '-'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => handleEdit(row)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
              title="Edit / Restock"
            >
              <FiEdit2 size={16} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setDeleteTarget(row)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
              title="Delete inventory record"
            >
              <FiTrash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page header with title and create button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Inventory</h1>
        {canCreate && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors text-sm font-medium"
          >
            <FiPlus size={18} />
            Add Inventory
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search by product name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
        />
      </div>

      {/* Inventory data table */}
      <Table columns={columns} data={filteredInventory} />

      {/* Create/Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Update Inventory' : 'Add Inventory Record'}
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Product *
            </label>
            <select
              value={form.productId}
              onChange={(e) => { setForm({ ...form, productId: e.target.value }); setErrors({ ...errors, productId: undefined }); }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm ${errors.productId ? 'border-red-400' : 'border-slate-200'}`}
              disabled={!!editing}
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.productId && <p className="text-red-500 text-xs mt-1">{errors.productId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              min="0"
              value={form.quantityInStock}
              onChange={(e) => { setForm({ ...form, quantityInStock: e.target.value }); setErrors({ ...errors, quantityInStock: undefined }); }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm ${errors.quantityInStock ? 'border-red-400' : 'border-slate-200'}`}
              placeholder={editing ? 'Enter new stock quantity' : 'Enter quantity'}
            />
            {errors.quantityInStock && <p className="text-red-500 text-xs mt-1">{errors.quantityInStock}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Warehouse Location
            </label>
            <input
              type="text"
              value={form.warehouseLocation}
              onChange={(e) => setForm({ ...form, warehouseLocation: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              placeholder="e.g., Warehouse A, Shelf B3"
            />
          </div>
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
              {editing ? 'Update Stock' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation dialog */}
      <DeleteConfirm
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.product?.name || 'this inventory record'}
      />
    </div>
  );
};

export default Inventory;

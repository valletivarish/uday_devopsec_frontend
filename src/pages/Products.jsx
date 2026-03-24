/**
 * Products.jsx - Product management page with full CRUD operations.
 * Displays a searchable, paginated table of products with
 * create, edit, and delete functionality via modals.
 */
import { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import DeleteConfirm from '../components/common/DeleteConfirm';
import { useAuth } from '../hooks/useAuth';

const CATEGORY_OPTIONS = [
  'ELECTRONICS',
  'CLOTHING',
  'FOOD',
  'BOOKS',
  'HOME',
  'SPORTS',
  'OTHER',
];

const Products = () => {
  const { canCreate, canEdit, canDelete } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal state management
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form fields for create/edit
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    sku: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  /** Fetch all products from the API */
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

  /** Filter products based on search input (matches name, category, or SKU) */
  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  /** Open the modal for creating a new product */
  const handleCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', price: '', category: '', sku: '' });
    setModalOpen(true);
  };

  /** Open the modal pre-filled with existing product data for editing */
  const handleEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      sku: product.sku || '',
    });
    setModalOpen(true);
  };

  /** Submit the form to create or update a product */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      if (editing) {
        await API.put(`/products/${editing._id || editing.id}`, payload);
        toast.success('Product updated successfully');
      } else {
        await API.post('/products', payload);
        toast.success('Product created successfully');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  /** Delete the selected product after confirmation */
  const handleDelete = async () => {
    try {
      await API.delete(`/products/${deleteTarget._id || deleteTarget.id}`);
      toast.success('Product deleted successfully');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  // Column definitions for the products table
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Category' },
    {
      key: 'price',
      label: 'Price',
      render: (row) => (
        <span className="font-medium">${Number(row.price).toFixed(2)}</span>
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
              title="Edit product"
            >
              <FiEdit2 size={16} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setDeleteTarget(row)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
              title="Delete product"
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
        <h1 className="text-2xl font-bold text-slate-800">Products</h1>
        {canCreate && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors text-sm font-medium"
          >
            <FiPlus size={18} />
            Add Product
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search by name, category, or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
        />
      </div>

      {/* Products data table with pagination */}
      <Table columns={columns} data={filteredProducts} />

      {/* Create/Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Product' : 'Create Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              SKU
            </label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              <option value="">Select a category</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Price *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
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
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation dialog */}
      <DeleteConfirm
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name}
      />
    </div>
  );
};

export default Products;

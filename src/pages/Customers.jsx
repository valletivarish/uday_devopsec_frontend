/**
 * Customers.jsx - Customer management page with full CRUD operations.
 * Displays a searchable, paginated table of customers with
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

const Customers = () => {
  const { canCreate, canEdit, canDelete } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form fields for create/edit
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    shippingStreet: '',
    shippingCity: '',
    shippingState: '',
    shippingPostcode: '',
    shippingCountry: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  /** Fetch all customers from the API */
  const fetchCustomers = async () => {
    try {
      const res = await API.get('/customers?limit=100');
      setCustomers(res.data.data || res.data);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  /** Filter customers by firstName, lastName, email, or phone */
  const filteredCustomers = customers.filter(
    (c) =>
      c.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      c.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  /** Open modal for creating a new customer */
  const handleCreate = () => {
    setEditing(null);
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      shippingStreet: '',
      shippingCity: '',
      shippingState: '',
      shippingPostcode: '',
      shippingCountry: '',
    });
    setModalOpen(true);
  };

  /** Open modal with pre-filled customer data for editing */
  const handleEdit = (customer) => {
    setEditing(customer);
    setForm({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      shippingStreet: customer.shippingStreet || '',
      shippingCity: customer.shippingCity || '',
      shippingState: customer.shippingState || '',
      shippingPostcode: customer.shippingPostcode || '',
      shippingCountry: customer.shippingCountry || '',
    });
    setModalOpen(true);
  };

  /** Submit create or update form */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/customers/${editing._id || editing.id}`, form);
        toast.success('Customer updated successfully');
      } else {
        await API.post('/customers', form);
        toast.success('Customer created successfully');
      }
      setModalOpen(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  /** Delete the selected customer */
  const handleDelete = async () => {
    try {
      await API.delete(`/customers/${deleteTarget._id || deleteTarget.id}`);
      toast.success('Customer deleted successfully');
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err) {
      toast.error('Failed to delete customer');
    }
  };

  // Column definitions for the customers table
  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <span className="font-medium">
          {row.firstName} {row.lastName}
        </span>
      ),
    },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'city',
      label: 'City',
      render: (row) => (
        <span className="text-slate-500">
          {row.shippingCity || '-'}
        </span>
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
              title="Edit customer"
            >
              <FiEdit2 size={16} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setDeleteTarget(row)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
              title="Delete customer"
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
        <h1 className="text-2xl font-bold text-slate-800">Customers</h1>
        {canCreate && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors text-sm font-medium"
          >
            <FiPlus size={18} />
            Add Customer
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
        />
      </div>

      {/* Customers data table */}
      <Table columns={columns} data={filteredCustomers} />

      {/* Create/Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Customer' : 'Create Customer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              value={form.shippingStreet}
              onChange={(e) => setForm({ ...form, shippingStreet: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={form.shippingCity}
                onChange={(e) => setForm({ ...form, shippingCity: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                State
              </label>
              <input
                type="text"
                value={form.shippingState}
                onChange={(e) => setForm({ ...form, shippingState: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Postcode
              </label>
              <input
                type="text"
                value={form.shippingPostcode}
                onChange={(e) => setForm({ ...form, shippingPostcode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={form.shippingCountry}
                onChange={(e) => setForm({ ...form, shippingCountry: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
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
        itemName={deleteTarget ? `${deleteTarget.firstName} ${deleteTarget.lastName}` : ''}
      />
    </div>
  );
};

export default Customers;

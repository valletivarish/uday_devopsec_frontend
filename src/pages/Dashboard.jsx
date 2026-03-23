/**
 * Dashboard.jsx - Overview page showing key business metrics.
 * Displays stats cards for total products, customers, orders, and
 * orders broken down by status, plus a low-stock alerts table.
 */
import { useState, useEffect } from 'react';
import API from '../api/axios';
import { FiBox, FiUsers, FiShoppingCart, FiAlertTriangle } from 'react-icons/fi';
import StatusBadge from '../components/common/StatusBadge';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    ordersByStatus: {},
    lowStockItems: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Fetches data from all API endpoints in parallel
   * and computes dashboard statistics from the responses.
   */
  const fetchDashboardData = async () => {
    try {
      const [productsRes, customersRes, ordersRes, inventoryRes] =
        await Promise.all([
          API.get('/products?limit=100'),
          API.get('/customers?limit=100'),
          API.get('/orders?limit=100'),
          API.get('/inventory?limit=100'),
        ]);

      const products = productsRes.data.data || productsRes.data;
      const customers = customersRes.data.data || customersRes.data;
      const orders = ordersRes.data.data || ordersRes.data;
      const inventory = inventoryRes.data.data || inventoryRes.data;

      // Count orders grouped by their status
      const ordersByStatus = orders.reduce((acc, order) => {
        const status = order.status || 'PLACED';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Identify inventory items with quantity below 10 as low-stock alerts
      const lowStockItems = inventory.filter(
        (item) => item.quantityInStock !== undefined && item.quantityInStock < 10
      );

      setStats({
        totalProducts: products.length,
        totalCustomers: customers.length,
        totalOrders: orders.length,
        ordersByStatus,
        lowStockItems,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
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

  // Configuration for the four main stats cards
  const statCards = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: FiBox,
      color: 'bg-emerald-500',
    },
    {
      label: 'Total Customers',
      value: stats.totalCustomers,
      icon: FiUsers,
      color: 'bg-teal-500',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: FiShoppingCart,
      color: 'bg-amber-500',
    },
    {
      label: 'Low Stock Alerts',
      value: stats.lowStockItems.length,
      icon: FiAlertTriangle,
      color: 'bg-rose-500',
    },
  ];

  // All possible order statuses for display
  const allStatuses = ['PLACED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      {/* Main stats cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-lg shadow-sm border border-emerald-100 p-5 flex items-center gap-4"
          >
            <div
              className={`${card.color} p-3 rounded-lg text-white flex-shrink-0`}
            >
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Orders by status breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-5">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Orders by Status
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {allStatuses.map((status) => (
            <div
              key={status}
              className="text-center p-4 rounded-lg bg-emerald-50/50 border border-emerald-100"
            >
              <StatusBadge status={status} />
              <p className="text-2xl font-bold text-slate-800 mt-2">
                {stats.ordersByStatus[status] || 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Low stock alerts table */}
      <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-5">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FiAlertTriangle className="text-red-500" />
          Low Stock Alerts
        </h2>
        {stats.lowStockItems.length === 0 ? (
          <p className="text-slate-400 text-sm">
            All inventory levels are healthy.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50/50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                    Current Stock
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {stats.lowStockItems.map((item) => (
                  <tr key={item._id || item.id}>
                    <td className="px-4 py-2 text-slate-700">
                      {item.product?.name || item.productName || 'N/A'}
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-red-600 font-semibold">
                        {item.quantityInStock}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-500">
                      {item.warehouseLocation || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

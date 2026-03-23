/**
 * StatusBadge.jsx - Color-coded badge component for order statuses.
 * Maps each order status to a distinct color scheme for quick visual identification.
 *
 * Status color mapping:
 *   PLACED    -> Yellow (pending/waiting)
 *   PAID      -> Blue (payment confirmed)
 *   SHIPPED   -> Purple (in transit)
 *   DELIVERED -> Green (completed)
 *   CANCELLED -> Red (cancelled)
 */

// Define Tailwind classes for each status
const statusStyles = {
  PLACED: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const StatusBadge = ({ status }) => {
  // Normalize the status string and fall back to a neutral gray if unknown
  const normalized = status?.toUpperCase() || '';
  const classes = statusStyles[normalized] || 'bg-gray-100 text-gray-800';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;

/**
 * DeleteConfirm.jsx - Confirmation modal for delete actions.
 * Prompts the user to confirm before permanently deleting a record.
 *
 * Props:
 *   isOpen    - Boolean to control visibility
 *   onClose   - Callback to cancel/close the dialog
 *   onConfirm - Callback executed when the user confirms deletion
 *   itemName  - Name of the item being deleted (shown in the message)
 */
import { FiAlertTriangle } from 'react-icons/fi';

const DeleteConfirm = ({ isOpen, onClose, onConfirm, itemName = 'this item' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Confirmation card */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm z-10 p-6 text-center">
        {/* Warning icon */}
        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <FiAlertTriangle className="text-red-600" size={24} />
        </div>

        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          Confirm Deletion
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Are you sure you want to delete <strong>{itemName}</strong>? This
          action cannot be undone.
        </p>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirm;

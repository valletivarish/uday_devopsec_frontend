/**
 * Modal.jsx - Reusable modal dialog for create/edit forms.
 * Renders a centered overlay with a white card containing the modal content.
 * Closes when clicking the backdrop or the close button.
 *
 * Props:
 *   isOpen   - Boolean to control visibility
 *   onClose  - Callback to close the modal
 *   title    - Header text for the modal
 *   children - Form content to display inside the modal body
 */
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Semi-transparent backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
        {/* Modal header with title and close button */}
        <div className="flex items-center justify-between p-5 border-b border-emerald-100">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            aria-label="Close modal"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Modal body - form fields go here */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

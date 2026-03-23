/**
 * Table.jsx - Reusable table component with built-in pagination.
 * Accepts column definitions and row data, and renders a responsive
 * paginated table with customizable page size.
 *
 * Props:
 *   columns - Array of { key, label, render? } defining table columns
 *   data    - Array of row objects
 *   pageSize - Number of rows per page (default 8)
 */
import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Table = ({ columns, data, pageSize = 8 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page whenever data changes (e.g., after search filter)
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const totalPages = Math.ceil(data.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const pageData = data.slice(startIdx, startIdx + pageSize);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-emerald-100 overflow-hidden">
      {/* Horizontally scrollable table wrapper for small screens */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-emerald-50/50 border-b border-emerald-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-100">
            {pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              pageData.map((row, idx) => (
                <tr
                  key={row._id || row.id || idx}
                  className="hover:bg-emerald-50/30 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-slate-700">
                      {/* Use custom render function if provided, otherwise display raw value */}
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls shown only when there are multiple pages */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-emerald-100 bg-emerald-50/50">
          <span className="text-sm text-slate-500">
            Showing {startIdx + 1}–{Math.min(startIdx + pageSize, data.length)}{' '}
            of {data.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
            >
              <FiChevronLeft size={16} />
            </button>
            <span className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;

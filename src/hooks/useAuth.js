/**
 * useAuth hook — provides current user info and role-based permission checks.
 *
 * Roles:
 *   admin   — Full access (create, read, update, delete)
 *   manager — Create, read, update (no delete)
 *   viewer  — Read-only
 */

export const useAuth = () => {
  const raw = localStorage.getItem('opm_user');
  const user = raw ? JSON.parse(raw) : null;
  const role = user?.role || 'viewer';

  return {
    user,
    role,
    isAdmin: role === 'admin',
    isManager: role === 'manager',
    isViewer: role === 'viewer',
    canCreate: role === 'admin' || role === 'manager',
    canEdit: role === 'admin' || role === 'manager',
    canDelete: role === 'admin',
  };
};

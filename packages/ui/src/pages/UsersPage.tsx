// React import removed - JSX transform handles it
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../services/api/hooks/useUsers';
import type { User } from '../services/api/models';
import { formatDate } from '../utils/date';

const ROLE_OPTIONS = ['admin', 'publisher', 'reader'];

function errMessage(e: unknown): string {
  const anyE = e as any;
  return anyE?.body?.error || anyE?.message || 'Something went wrong';
}

type FormState = {
  id?: string;
  username: string;
  email: string;
  password: string;
  roles: string[];
  is_active: boolean;
};

const emptyForm: FormState = { username: '', email: '', password: '', roles: ['reader'], is_active: true };

export function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const isEdit = !!form.id;

  const { data, isLoading, error } = useUsers({
    search: searchTerm || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
  });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const users: User[] = data?.users || [];
  const total = data?.pagination?.total ?? users.length;

  const openCreate = () => { setForm(emptyForm); setModalOpen(true); };
  const openEdit = (u: User) => {
    setForm({ id: u.id, username: u.username, email: u.email, password: '', roles: u.roles, is_active: u.is_active });
    setModalOpen(true);
  };

  const toggleRole = (role: string) => {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && form.id) {
        const payload: any = { username: form.username, email: form.email, roles: form.roles, is_active: form.is_active };
        if (form.password) payload.password = form.password;
        await updateUser.mutateAsync({ id: form.id, data: payload });
        toast.success('User updated');
      } else {
        const payload: any = { username: form.username, email: form.email, roles: form.roles, is_active: form.is_active };
        if (form.password) payload.password = form.password;
        await createUser.mutateAsync(payload);
        toast.success('User created');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(errMessage(err));
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete user "${user.username}"? This cannot be undone.`)) return;
    try {
      await deleteUser.mutateAsync(user.id);
      toast.success('User deleted');
    } catch (err) {
      toast.error(errMessage(err));
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await updateUser.mutateAsync({ id: user.id, data: { is_active: !user.is_active } });
    } catch (err) {
      toast.error(errMessage(err));
    }
  };

  const activeCount = users.filter((u) => u.is_active).length;
  const adminCount = users.filter((u) => u.roles.includes('admin')).length;
  const publisherCount = users.filter((u) => u.roles.includes('publisher')).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button onClick={openCreate} className="btn-primary flex items-center space-x-2">
          <UserPlusIcon className="h-5 w-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="form-input pl-10"
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select className="form-input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="publisher">Publisher</option>
                <option value="reader">Reader</option>
              </select>
            </div>
            <div className="w-full md:w-48">
              <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-body">
          {error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">Failed to load users. You may not have permission to view this page.</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-8 text-gray-600">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <span
                              key={role}
                              className={`px-2 py-1 text-xs rounded-full ${
                                role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                role === 'publisher' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-full ${
                            user.is_active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          } transition-colors`}
                        >
                          {user.is_active ? <CheckCircleIcon className="h-3 w-3" /> : <XCircleIcon className="h-3 w-3" />}
                          <span>{user.is_active ? 'active' : 'inactive'}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.servers_published ?? 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_login ? formatDate(user.last_login) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => openEdit(user)} className="text-indigo-600 hover:text-indigo-900" title="Edit user">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(user)} className="text-red-600 hover:text-red-900" title="Delete user">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No users found matching your criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="card"><div className="card-body">
          <p className="text-sm font-medium text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
        </div></div>
        <div className="card"><div className="card-body">
          <p className="text-sm font-medium text-gray-600">Active (page)</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
        </div></div>
        <div className="card"><div className="card-body">
          <p className="text-sm font-medium text-gray-600">Admins (page)</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{adminCount}</p>
        </div></div>
        <div className="card"><div className="card-body">
          <p className="text-sm font-medium text-gray-600">Publishers (page)</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{publisherCount}</p>
        </div></div>
      </div>

      {/* Create / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">{isEdit ? 'Edit User' : 'Add User'}</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="form-label">Username</label>
                  <input className="form-input" value={form.username} required
                    onChange={(e) => setForm({ ...form, username: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={form.email} required
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">{isEdit ? 'New Password (optional)' : 'Password (optional)'}</label>
                  <input type="password" className="form-input" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Leave blank to skip" />
                </div>
                <div>
                  <label className="form-label">Roles</label>
                  <div className="flex gap-4">
                    {ROLE_OPTIONS.map((role) => (
                      <label key={role} className="flex items-center space-x-2 text-sm">
                        <input type="checkbox" checked={form.roles.includes(role)} onChange={() => toggleRole(role)} />
                        <span className="capitalize">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <label className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                  <span>Active</span>
                </label>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={createUser.isPending || updateUser.isPending || form.roles.length === 0}>
                  {isEdit ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

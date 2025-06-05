import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { setUsers, addUser, updateUser, deleteUser, setLoading, setError } from '../store/slices/userSlice';
import * as userApi from '../api/users';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'cashier', label: 'Cashier' },
];

const Users = () => {
  const dispatch = useDispatch();
  const { users, isLoading, error } = useSelector((state: RootState) => state.users);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [form, setForm] = useState({ id: '', username: '', email: '', password: '', role: 'cashier' });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        dispatch(setLoading(true));
        const data = await userApi.getUsers();
        dispatch(setUsers(data));
        dispatch(setLoading(false));
      } catch (err: any) {
        dispatch(setError('Failed to fetch users'));
        dispatch(setLoading(false));
      }
    };
    fetchUsers();
  }, [dispatch]);

  const handleOpenAddModal = () => {
    setForm({ id: '', username: '', email: '', password: '', role: 'cashier' });
    setFormError(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleOpenEditModal = (user: any) => {
    setForm({ id: user.id, username: user.username, email: user.email, password: '', role: user.role });
    setFormError(null);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        const newUser = await userApi.createUser(form);
        dispatch(addUser(newUser));
        setShowModal(false);
      } else {
        const updated = await userApi.updateUser(form.id, {
          username: form.username,
          email: form.email,
          password: form.password || undefined, // Only send if changed
          role: form.role,
        });
        dispatch(updateUser(updated));
        setShowModal(false);
      }
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await userApi.deleteUser(deleteId);
      dispatch(deleteUser(deleteId));
      setDeleteId(null);
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
          onClick={handleOpenAddModal}
        >
          Add User
        </button>
      </div>
      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={handleCloseModal}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add User' : 'Edit User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="username"
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
              <input
                name="password"
                type="password"
                placeholder={modalMode === 'add' ? 'Password' : 'Leave blank to keep current password'}
                value={form.password}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required={modalMode === 'add'}
              />
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                {roleOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <button
                type="submit"
                className="w-full py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
                disabled={submitting}
              >
                {submitting ? (modalMode === 'add' ? 'Adding...' : 'Saving...') : (modalMode === 'add' ? 'Add User' : 'Save Changes')}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm relative">
            <h2 className="text-xl font-bold mb-4">Delete User</h2>
            <p className="mb-4">Are you sure you want to delete this user?</p>
            {deleteError && <div className="text-red-600 text-sm mb-2">{deleteError}</div>}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setDeleteId(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="overflow-x-auto bg-white rounded shadow">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-pink-50 text-pink-700">
                <th className="px-4 py-2 text-left">Username</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-2">{user.username}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.role}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-blue-600 hover:underline mr-2"
                      onClick={() => handleOpenEditModal(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => setDeleteId(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Users; 
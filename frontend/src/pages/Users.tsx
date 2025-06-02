import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import type { User } from '../store/slices/userSlice';
import * as userApi from '../api/users';
import Spinner from '../components/Spinner';
import { useNotification } from '../context/NotificationContext';
import {
  setUsers,
  addUser as addUserAction,
  updateUser as updateUserAction,
  deleteUser as deleteUserAction,
  setLoading,
  setError,
} from '../store/slices/userSlice';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'cashier', label: 'Cashier' },
];

const Users = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { users, isLoading } = useSelector((state: RootState) => state.users);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'cashier' });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { showNotification } = useNotification();

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        dispatch(setLoading(true));
        const data = await userApi.getUsers();
        dispatch(setUsers(data));
        dispatch(setLoading(false));
      } catch (err: any) {
        dispatch(setError('Failed to fetch users'));
        showNotification('Failed to fetch users', 'error');
        dispatch(setLoading(false));
      }
    };
    fetchUsers();
  }, [dispatch, showNotification]);

  // Add user
  const handleAddUser = async () => {
    try {
      dispatch(setLoading(true));
      const created = await userApi.createUser(newUser);
      dispatch(addUserAction(created));
      showNotification('User added', 'success');
      setNewUser({ username: '', email: '', password: '', role: 'cashier' });
      dispatch(setLoading(false));
    } catch (err: any) {
      dispatch(setError('Failed to add user'));
      showNotification('Failed to add user', 'error');
      dispatch(setLoading(false));
    }
  };

  // Edit user
  const handleEditUser = async () => {
    if (!editingUser) return;
    try {
      dispatch(setLoading(true));
      const updated = await userApi.updateUser(editingUser.id, editingUser);
      dispatch(updateUserAction(updated));
      showNotification('User updated', 'success');
      setEditingUser(null);
      dispatch(setLoading(false));
    } catch (err: any) {
      dispatch(setError('Failed to update user'));
      showNotification('Failed to update user', 'error');
      dispatch(setLoading(false));
    }
  };

  // Delete user
  const handleDeleteUser = async (id: string) => {
    try {
      dispatch(setLoading(true));
      await userApi.deleteUser(id);
      dispatch(deleteUserAction(id));
      showNotification('User deleted', 'success');
      dispatch(setLoading(false));
    } catch (err: any) {
      dispatch(setError('Failed to delete user'));
      showNotification('Failed to delete user', 'error');
      dispatch(setLoading(false));
    }
  };

  if (user?.role !== 'admin') {
    return <div className="p-6">You do not have access to this page.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">User Management</h1>
      {isLoading && <Spinner />}
      {/* Add User Form */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-lg font-bold mb-2">Add User</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Username"
            value={newUser.username}
            onChange={e => setNewUser({ ...newUser, username: e.target.value })}
            className="input"
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
            className="input"
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
            className="input"
          />
          <select
            value={newUser.role}
            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
            className="input"
          >
            {roleOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button className="btn" onClick={handleAddUser}>Add</button>
        </div>
      </div>
      {/* Users Table */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-bold mb-2">Users</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser?.id === u.id ? (
                    <input
                      type="text"
                      value={editingUser.username}
                      onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                      className="input"
                    />
                  ) : (
                    u.username
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser?.id === u.id ? (
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="input"
                    />
                  ) : (
                    u.email
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser?.id === u.id ? (
                    <select
                      value={editingUser.role}
                      onChange={e => setEditingUser({ ...editingUser, role: e.target.value as User['role'] })}
                      className="input"
                    >
                      {roleOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    u.role
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser?.id === u.id ? (
                    <>
                      <button className="btn mr-2" onClick={handleEditUser}>Save</button>
                      <button className="btn" onClick={() => setEditingUser(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn mr-2" onClick={() => setEditingUser(u)}>Edit</button>
                      <button className="btn" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users; 
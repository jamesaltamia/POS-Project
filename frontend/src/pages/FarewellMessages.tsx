import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import type { FarewellMessage } from '../store/slices/farewellMessageSlice';
import * as farewellApi from '../api/farewellMessages';
import Spinner from '../components/Spinner';
import { useNotification } from '../context/NotificationContext';
import {
  setMessages,
  addMessage as addMessageAction,
  updateMessage as updateMessageAction,
  deleteMessage as deleteMessageAction,
  setLoading,
  setError,
} from '../store/slices/farewellMessageSlice';

const FarewellMessages = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { messages, isLoading } = useSelector((state: RootState) => state.farewellMessages);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<FarewellMessage | null>(null);
  const { showNotification } = useNotification();

  // Fetch messages on mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        dispatch(setLoading(true));
        const data = await farewellApi.getFarewellMessages();
        dispatch(setMessages(data));
        dispatch(setLoading(false));
      } catch (err: any) {
        dispatch(setError('Failed to fetch messages'));
        showNotification('Failed to fetch messages', 'error');
        dispatch(setLoading(false));
      }
    };
    fetchMessages();
  }, [dispatch, showNotification]);

  // Add message
  const handleAddMessage = async () => {
    try {
      dispatch(setLoading(true));
      const created = await farewellApi.createFarewellMessage({ message: newMessage });
      dispatch(addMessageAction(created));
      showNotification('Message added', 'success');
      setNewMessage('');
      dispatch(setLoading(false));
    } catch (err: any) {
      dispatch(setError('Failed to add message'));
      showNotification('Failed to add message', 'error');
      dispatch(setLoading(false));
    }
  };

  // Edit message
  const handleEditMessage = async () => {
    if (!editingMessage) return;
    try {
      dispatch(setLoading(true));
      const updated = await farewellApi.updateFarewellMessage(editingMessage.id, editingMessage);
      dispatch(updateMessageAction(updated));
      showNotification('Message updated', 'success');
      setEditingMessage(null);
      dispatch(setLoading(false));
    } catch (err: any) {
      dispatch(setError('Failed to update message'));
      showNotification('Failed to update message', 'error');
      dispatch(setLoading(false));
    }
  };

  // Delete message
  const handleDeleteMessage = async (id: string) => {
    try {
      dispatch(setLoading(true));
      await farewellApi.deleteFarewellMessage(id);
      dispatch(deleteMessageAction(id));
      showNotification('Message deleted', 'success');
      dispatch(setLoading(false));
    } catch (err: any) {
      dispatch(setError('Failed to delete message'));
      showNotification('Failed to delete message', 'error');
      dispatch(setLoading(false));
    }
  };

  if (user?.role !== 'admin') {
    return <div className="p-6">You do not have access to this page.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Manage Farewell Messages</h1>
      {isLoading && <Spinner />}
      {/* Add Message Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-bold mb-2">Add Message</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Farewell message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            className="input flex-1"
          />
          <button className="btn" onClick={handleAddMessage}>Add</button>
        </div>
      </div>
      {/* Messages Table */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-2">Messages</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map(m => (
              <tr key={m.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingMessage?.id === m.id ? (
                    <input
                      type="text"
                      value={editingMessage.message}
                      onChange={e => setEditingMessage({ ...editingMessage, message: e.target.value })}
                      className="input w-full"
                    />
                  ) : (
                    m.message
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingMessage?.id === m.id ? (
                    <>
                      <button className="btn mr-2" onClick={handleEditMessage}>Save</button>
                      <button className="btn" onClick={() => setEditingMessage(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn mr-2" onClick={() => setEditingMessage(m)}>Edit</button>
                      <button className="btn" onClick={() => handleDeleteMessage(m.id)}>Delete</button>
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

export default FarewellMessages; 
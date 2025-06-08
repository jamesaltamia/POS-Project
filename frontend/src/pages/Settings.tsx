import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const Settings = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'system'>(
    'profile'
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`${
              activeTab === 'preferences'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Preferences
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('system')}
              className={`${
                activeTab === 'system'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              System
            </button>
          )}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Profile Information
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your personal information and contact details.
                  </p>
                </div>
                <div className="mt-5 md:mt-0 md:col-span-2">
                  <form className="space-y-6">
                    <div>
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        id="username"
                        defaultValue={user?.username}
                        className="mt-1 input"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        defaultValue={user?.email}
                        className="mt-1 input"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="role"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Role
                      </label>
                      <input
                        type="text"
                        name="role"
                        id="role"
                        value={user?.role}
                        disabled
                        className="mt-1 input bg-gray-50"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button type="submit" className="btn">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Password
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your password to keep your account secure.
                  </p>
                </div>
                <div className="mt-5 md:mt-0 md:col-span-2">
                  <form className="space-y-6">
                    <div>
                      <label
                        htmlFor="current-password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="current-password"
                        id="current-password"
                        className="mt-1 input"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="new-password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        New Password
                      </label>
                      <input
                        type="password"
                        name="new-password"
                        id="new-password"
                        className="mt-1 input"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirm-password"
                        id="confirm-password"
                        className="mt-1 input"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button type="submit" className="btn">
                        Change Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Display Preferences
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Customize how information is displayed in the application.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <form className="space-y-6">
                  <div>
                    <label
                      htmlFor="currency"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Currency
                    </label>
                    <select
                      id="currency"
                      name="currency"
                      className="mt-1 input"
                      defaultValue="USD"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="PHP">PHP (₱)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="date-format"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Date Format
                    </label>
                    <select
                      id="date-format"
                      name="date-format"
                      className="mt-1 input"
                      defaultValue="MM/DD/YYYY"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="notifications"
                        name="notifications"
                        type="checkbox"
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="notifications"
                        className="font-medium text-gray-700"
                      >
                        Enable Notifications
                      </label>
                      <p className="text-gray-500">
                        Receive notifications for new orders and low stock alerts.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="btn">
                      Save Preferences
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && user?.role === 'admin' && (
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  System Settings
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Configure system-wide settings and integrations.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <form className="space-y-6">
                  <div>
                    <label
                      htmlFor="company-name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="company-name"
                      id="company-name"
                      className="mt-1 input"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="tax-rate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      name="tax-rate"
                      id="tax-rate"
                      className="mt-1 input"
                      defaultValue={10}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="receipt-footer"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Receipt Footer Message
                    </label>
                    <textarea
                      id="receipt-footer"
                      name="receipt-footer"
                      rows={3}
                      className="mt-1 input"
                      defaultValue="Thank you for your business!"
                    />
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="maintenance-mode"
                        name="maintenance-mode"
                        type="checkbox"
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="maintenance-mode"
                        className="font-medium text-gray-700"
                      >
                        Maintenance Mode
                      </label>
                      <p className="text-gray-500">
                        Enable maintenance mode to prevent new transactions.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="btn">
                      Save Settings
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings; 
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { CircularProgress, Alert } from '@mui/material';

interface DashboardData {
  amount: number;
  currency: string;
  date: string;
  trend?: string;
}

const AdminDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [dailySales, setDailySales] = useState<DashboardData | null>(null);
  const [dailyProfit, setDailyProfit] = useState<DashboardData | null>(null);
  const [loadingSales, setLoadingSales] = useState<boolean>(true);
  const [loadingProfit, setLoadingProfit] = useState<boolean>(true);
  const [errorSales, setErrorSales] = useState<string | null>(null);
  const [errorProfit, setErrorProfit] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with timeout
    const fetchData = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data - replace with actual API calls
        setDailySales({
          amount: 1250.75,
          currency: '₱',
          date: new Date().toISOString(),
          trend: '↑ 12% from yesterday'
        });

        setDailyProfit({
          amount: 850.30,
          currency: '₱',
          date: new Date().toISOString(),
          trend: '↑ 8% from yesterday'
        });

      } catch (error) {
        setErrorSales('Failed to load dashboard data');
        setErrorProfit('Failed to load dashboard data');
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoadingSales(false);
        setLoadingProfit(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manager Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800">
          Welcome, {user?.name || 'Manager'}
        </h2>
        <p className="text-gray-600">Here's your daily overview for {new Date().toLocaleDateString()}</p>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sales Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Daily Sales</h3>
            {loadingSales ? (
              <div className="flex justify-center py-4">
                <CircularProgress size={24} />
              </div>
            ) : errorSales ? (
              <Alert severity="error" className="mt-2">{errorSales}</Alert>
            ) : dailySales ? (
              <div>
                <p className="text-2xl font-bold">
                  {dailySales.currency} {dailySales.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {dailySales.trend} • {new Date(dailySales.date).toLocaleDateString()}
                </p>
              </div>
            ) : null}
          </div>

          {/* Profit Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Daily Profit</h3>
            {loadingProfit ? (
              <div className="flex justify-center py-4">
                <CircularProgress size={24} />
              </div>
            ) : errorProfit ? (
              <Alert severity="error" className="mt-2">{errorProfit}</Alert>
            ) : dailyProfit ? (
              <div>
                <p className="text-2xl font-bold">
                  {dailyProfit.currency} {dailyProfit.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {dailyProfit.trend} • {new Date(dailyProfit.date).toLocaleDateString()}
                </p>
              </div>
            ) : null}
          </div>

          {/* Add more cards as needed */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Today's Orders</h3>
            <p className="text-2xl font-bold">24</p>
            <p className="text-sm text-gray-500 mt-1">↑ 3 from yesterday</p>
          </div>
        </div>
      </div>
  );
};

export default AdminDashboard;
import { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import * as productApi from '../api/products';
import Spinner from '../components/Spinner';

interface Product {
  id: string | number;
  name: string;
  stock: number;
  low_stock_threshold: number;
}

const StockMonitor = () => {
  const { showNotification } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTestData, setShowTestData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await productApi.getProducts();
        setProducts(Array.isArray(response) ? response : response?.data || []);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load stock data');
        showNotification('Failed to load stock data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [showNotification]);

  // Process products to ensure they have the required fields
  const processedProducts = (() => {
    if (showTestData) {
      return [
        { id: 1, name: 'Test Product 1', stock: 3, low_stock_threshold: 10 },
        { id: 2, name: 'Test Product 2', stock: 8, low_stock_threshold: 10 },
        { id: 3, name: 'Test Product 3', stock: 0, low_stock_threshold: 5 },
        { id: 4, name: 'Test Product 4', stock: 15, low_stock_threshold: 20 },
      ];
    }

    return products.map(product => {
      // Ensure product is an object and has required fields
      if (!product || typeof product !== 'object') {
        return { id: Math.random(), name: 'Invalid Product', stock: 0, low_stock_threshold: 10 };
      }
      
      return {
        id: product.id || Math.random(),
        name: product.name || 'Unnamed Product',
        stock: typeof product.stock === 'number' ? product.stock : 0,
        low_stock_threshold: typeof product.low_stock_threshold === 'number' 
          ? product.low_stock_threshold 
          : 10
      };
    });
  })();

  // Filter products into categories
  const lowStockItems = processedProducts.filter((p: any) => p.stock <= p.low_stock_threshold && p.stock > 0);
  const outOfStockItems = processedProducts.filter((p: any) => p.stock === 0);
  const inStockItems = processedProducts.filter((p: any) => p.stock > p.low_stock_threshold);

  if (loading) return <Spinner />;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stock Monitoring</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowTestData(!showTestData)}
            className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-200"
          >
            {showTestData ? 'Hide Test Data' : 'Show Test Data'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Products</h3>
          <p className="text-3xl font-bold">{processedProducts.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Low Stock</h3>
          <p className="text-3xl font-bold text-yellow-600">{lowStockItems.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Out of Stock</h3>
          <p className="text-3xl font-bold text-red-600">{outOfStockItems.length}</p>
        </div>
      </div>

      {/* Stock Status */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Status</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>In Stock</span>
              <span>{inStockItems.length} items</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{
                  width: processedProducts.length > 0 ? `${(inStockItems.length / processedProducts.length) * 100}%` : '0%'
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Low Stock</span>
              <span>{lowStockItems.length} items</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-yellow-500 h-2.5 rounded-full" 
                style={{
                  width: processedProducts.length > 0 ? `${(lowStockItems.length / processedProducts.length) * 100}%` : '0%'
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Out of Stock</span>
              <span>{outOfStockItems.length} items</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-red-500 h-2.5 rounded-full" 
                style={{
                  width: processedProducts.length > 0 ? `${(outOfStockItems.length / processedProducts.length) * 100}%` : '0%'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Inventory</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processedProducts.map((product) => {
                  let statusClass = '';
                  let statusText = '';
                  
                  if (product.stock === 0) {
                    statusClass = 'bg-red-100 text-red-800';
                    statusText = 'Out of Stock';
                  } else if (product.stock <= product.low_stock_threshold) {
                    statusClass = 'bg-yellow-100 text-yellow-800';
                    statusText = 'Low Stock';
                  } else {
                    statusClass = 'bg-green-100 text-green-800';
                    statusText = 'In Stock';
                  }
                  
                  return (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.stock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockMonitor;

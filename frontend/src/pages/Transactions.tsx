import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import type { Product } from "../store/slices/productSlice";
import * as feedbackApi from '../api/feedback';
import * as transactionApi from '../api/transactions';
import Spinner from '../components/Spinner';
import { useNotification } from '../context/NotificationContext';

const Transactions: React.FC = () => {
  const { products, isLoading: productsLoading } = useSelector((state: RootState) => state.products);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [discount, setDiscount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyRating, setSurveyRating] = useState<number | null>(null);
  const [farewell, setFarewell] = useState('Thank you for your purchase!');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const { showNotification } = useNotification();
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState<any | any[]>([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const farewellMessages = [
    "Thank you for your purchase!",
    "Have a great day!",
    "We appreciate your business!"
  ];

  // Fetch today's transactions on mount and after sale
  const fetchTransactions = async () => {
    try {
      const data = await transactionApi.getTransactions();
      setTransactions(data);
    } catch (err) {
      // Optionally handle error
    }
  };
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Add product to cart
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const found = prev.find((item) => item.product.id === product.id);
      if (found) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  // Remove product from cart
  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Calculate total
  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discountedTotal = total - discount;

  // Handle payment
  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const payload = {
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        total,
        paymentMethod: 'cash', // For now, hardcoded
      };
      const tx = await transactionApi.createTransaction(payload);
      setLastTransaction(tx);
      setShowReceipt(true);
      setShowSurvey(true);
      setFarewell(
        farewellMessages[Math.floor(Math.random() * farewellMessages.length)]
      );
      setCart([]);
      setDiscount(0);
      showNotification('Transaction completed!', 'success');
      fetchTransactions();
    } catch (err: any) {
      setCheckoutError(err?.response?.data?.message || 'Failed to complete transaction');
      showNotification('Failed to complete transaction', 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Handle survey submit
  const handleSurveySubmit = async () => {
    if (surveyRating === null) return;
    setFeedbackLoading(true);
    try {
      await feedbackApi.submitFeedback({ rating: surveyRating });
      showNotification('Thank you for your feedback!', 'success');
      setShowSurvey(false);
      setSurveyRating(null);
    } catch (err: any) {
      showNotification('Failed to submit feedback', 'error');
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Print receipt (stub)
  const handlePrintReceipt = () => {
    window.print();
  };

  // Email receipt (stub)
  const handleEmailReceipt = () => {
    alert("Email sent! (stub)");
  };

  // Filter products by search
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  // Today's Transactions
  const transactionList = Array.isArray(transactions)
    ? transactions
    : Array.isArray(transactions?.data)
      ? transactions.data
      : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* POS Section */}
      <div className="md:col-span-2 bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Point of Sale</h1>
        {/* Product Search & Add to Cart */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full border rounded px-3 py-2"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Product List */}
        <div className="mb-6">
          {productsLoading ? (
            <Spinner />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="border rounded p-2 flex flex-col items-center">
                  {product.image && (
                    <img src={product.image} alt={product.name} className="h-12 w-12 object-cover rounded mb-2" />
                  )}
                  <span className="font-semibold">{product.name}</span>
                  <span className="text-sm text-gray-500 mb-2">${product.price.toFixed(2)}</span>
                  <button
                    className="px-2 py-1 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add
                  </button>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center text-gray-400">No products found</div>
              )}
            </div>
          )}
        </div>
        {/* Cart Items */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Cart</h2>
          <div className="bg-gray-50 rounded p-4 min-h-[120px] flex flex-col gap-2">
            {cart.length === 0 ? (
              <div className="text-gray-400">No items in cart.</div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center">
                  <span>{item.product.name} x{item.quantity}</span>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                  <button
                    className="ml-2 text-red-600 hover:underline text-xs"
                    onClick={() => handleRemoveFromCart(item.product.id)}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Cart Summary & Checkout */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-xl font-bold">Total: ${total.toFixed(2)}</div>
          <button
            className="px-6 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
            onClick={handleCheckout}
            disabled={cart.length === 0 || checkoutLoading}
          >
            {checkoutLoading ? 'Processing...' : 'Checkout'}
          </button>
        </div>
        {checkoutError && <div className="text-red-600 mt-2">{checkoutError}</div>}
        {/* Receipt Modal */}
        {showReceipt && lastTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                onClick={() => setShowReceipt(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4">Receipt</h2>
              <div className="mb-2 text-sm text-gray-500">Transaction #{lastTransaction.id}</div>
              <div className="mb-2 text-sm text-gray-500">{new Date(lastTransaction.createdAt).toLocaleString()}</div>
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr>
                    <th className="text-left">Item</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {lastTransaction.items.map((item: any) => (
                    <tr key={item.product.id}>
                      <td>{item.product.name}</td>
                      <td className="text-right">{item.quantity}</td>
                      <td className="text-right">${(item.product.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between font-bold text-lg mb-2">
                <span>Total</span>
                <span>${lastTransaction.total.toFixed(2)}</span>
              </div>
              <div className="mb-4 text-sm text-gray-500">Payment: {lastTransaction.paymentMethod}</div>
              <div className="mb-4 text-center text-green-700 font-semibold">{farewell}</div>
              <div className="flex gap-2 justify-center">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={handlePrintReceipt}
                >
                  Print
                </button>
                <button
                  className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                  onClick={handleEmailReceipt}
                >
                  Email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Today's Transactions */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4">Today's Transactions</h2>
        <div className="space-y-2">
          {transactionList.length === 0 ? (
            <div className="text-gray-400">No transactions yet today.</div>
          ) : (
            transactionList.map((tx: any) => (
              <div key={tx.id} className="border-b pb-2">
                <div className="flex justify-between">
                  <span className="font-semibold">#{tx.id}</span>
                  <span className="text-green-600">${tx.total.toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {tx.items.length} item{tx.items.length !== 1 ? 's' : ''}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
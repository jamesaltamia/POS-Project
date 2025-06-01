 import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { addTransaction } from "../store/slices/transactionSlice";
import { Product } from "../store/slices/productSlice";

const Transactions: React.FC = () => {
  // State for cart, discount, payment, survey, and farewell message
  const products = useSelector((state: RootState) => state.products.items);
  const farewellMessages = ["Thank you for your purchase!", "Have a great day!", "We appreciate your business!"];
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [discount, setDiscount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyRating, setSurveyRating] = useState<number | null>(null);
  const [farewell, setFarewell] = useState(farewellMessages[0]);
  const dispatch = useDispatch();

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
  const handleRemoveFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Calculate total
  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discountedTotal = total - discount;

  // Handle payment
  const handleCheckout = () => {
    // Dispatch transaction (stub)
    dispatch(
      addTransaction({
        items: cart,
        total,
        discount,
        finalTotal: discountedTotal,
        date: new Date().toISOString(),
      })
    );
    setShowReceipt(true);
    setShowSurvey(true);
    setFarewell(
      farewellMessages[Math.floor(Math.random() * farewellMessages.length)]
    );
    setCart([]);
    setDiscount(0);
  };

  // Handle survey submit
  const handleSurveySubmit = () => {
    // Save feedback (stub)
    setShowSurvey(false);
  };

  // Print receipt (stub)
  const handlePrintReceipt = () => {
    window.print();
  };

  // Email receipt (stub)
  const handleEmailReceipt = () => {
    alert("Email sent! (stub)");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Point of Sale (POS)</h1>

      {/* Product Selection */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded p-2 flex flex-col items-center"
            >
              <span>{product.name}</span>
              <span className="text-sm text-gray-500">${product.price}</span>
              <button
                className="mt-2 px-2 py-1 bg-blue-500 text-white rounded"
                onClick={() => handleAddToCart(product)}
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Cart */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Cart</h2>
        {cart.length === 0 ? (
          <p>No items in cart.</p>
        ) : (
          <table className="w-full mb-2">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.product.id}>
                  <td>{item.product.name}</td>
                  <td>{item.quantity}</td>
                  <td>${item.product.price * item.quantity}</td>
                  <td>
                    <button
                      className="text-red-500"
                      onClick={() => handleRemoveFromCart(item.product.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="flex items-center gap-2">
          <span>Discount:</span>
          <input
            type="number"
            value={discount}
            min={0}
            max={total}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="border rounded px-2 py-1 w-20"
          />
        </div>
        <div className="mt-2 font-bold">
          Total: ${discountedTotal >= 0 ? discountedTotal : 0}
        </div>
        <button
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
          onClick={handleCheckout}
          disabled={cart.length === 0}
        >
          Checkout
        </button>
      </section>

      {/* Receipt */}
      {showReceipt && (
        <section className="mb-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Receipt</h2>
          <div className="bg-gray-100 p-4 rounded">
            <ul>
              {cart.map((item) => (
                <li key={item.product.id}>
                  {item.product.name} x {item.quantity} = $
                  {item.product.price * item.quantity}
                </li>
              ))}
            </ul>
            <div>Discount: ${discount}</div>
            <div className="font-bold">Total: ${discountedTotal}</div>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded"
              onClick={handlePrintReceipt}
            >
              Print
            </button>
            <button
              className="px-3 py-1 bg-indigo-500 text-white rounded"
              onClick={handleEmailReceipt}
            >
              Email
            </button>
          </div>
        </section>
      )}

      {/* Survey */}
      {showSurvey && (
        <section className="mb-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">How was your experience?</h2>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                className={`px-3 py-1 rounded ${
                  surveyRating === rating
                    ? "bg-yellow-400"
                    : "bg-gray-200 hover:bg-yellow-200"
                }`}
                onClick={() => setSurveyRating(rating)}
              >
                {rating} ⭐
              </button>
            ))}
          </div>
          <button
            className="mt-2 px-4 py-1 bg-green-500 text-white rounded"
            onClick={handleSurveySubmit}
            disabled={surveyRating === null}
          >
            Submit Feedback
          </button>
        </section>
      )}

      {/* Farewell Message */}
      {showReceipt && (
        <div className="text-center text-lg font-semibold text-green-700 mt-4">
          {farewell}
        </div>
      )}
    </div>
  );
};

export default Transactions;
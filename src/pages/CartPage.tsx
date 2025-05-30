import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useCart } from '../contexts/CartContext';

const CartPage: React.FC = () => {
  const { state: { items, total }, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
            Shopping Cart
          </h1>

          <div className="space-y-6 mb-8">
            {items.map((item) => (
              <div key={`${item.id}-${item.variantId}`} className="flex items-center border-b pb-6">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1 ml-6">
                  <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                  {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                  {item.color && <p className="text-sm text-gray-600">Color: {item.color}</p>}
                  <div className="flex items-center mt-2">
                    <select
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, Number(e.target.value), item.variantId)}
                      className="border border-gray-300 rounded-md text-base"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeItem(item.id, item.variantId)}
                      className="ml-4 text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="text-right ml-6">
                  <p className="text-lg font-medium text-gray-900">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    ₹{item.price.toLocaleString()} each
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-8">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg text-gray-900">Subtotal</span>
              <span className="text-2xl font-medium text-gray-900">
                ₹{total.toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-6">
              Shipping and taxes calculated at checkout
            </div>
            <div className="flex justify-between">
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Continue Shopping
              </Link>
              <Link
                to="/checkout"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
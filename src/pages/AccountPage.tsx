import React, { useEffect, useState } from 'react';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { Link, Navigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

type OrderRow = {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
};

type AddressRow = {
  id: number;
  type: string;
  first_name: string;
  last_name: string;
  address_line_1: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
};

const AccountPage: React.FC = () => {
  const { customer } = useCustomerAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!customer?.email) { 
        setLoading(false); 
        return; 
      }

      try {
        // For now, get all orders and addresses since RLS isn't implemented yet
        // In production, this would be filtered by customer_id via RLS
        const [{ data: ords }, { data: addrs }] = await Promise.all([
          supabase.from('orders')
            .select('id, order_number, status, total_amount, created_at')
            .order('created_at', { ascending: false }),
          supabase.from('customer_addresses')
            .select('id, type, first_name, last_name, address_line_1, city, state, postal_code, is_default')
            .order('is_default', { ascending: false })
        ]);
        setOrders(ords || []);
        setAddresses(addrs || []);
      } catch (error) {
        console.error('Error loading account data:', error);
      }
      setLoading(false);
    };
    load();
  }, [customer?.email]);

  if (!customer && import.meta.env.PROD) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-serif font-bold mb-6">My Account</h1>
      {!customer && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
          You're not signed in. In development you can still view demo data if available.
        </div>
      )}
      {customer && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded">
          Welcome back, {customer.first_name} {customer.last_name}! ({customer.email})
        </div>
      )}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading your account...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No orders found</p>
                <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">Order #{order.order_number}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">
                          {order.status}
                        </span>
                        <p className="font-medium mt-1">₹{order.total_amount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Saved Addresses</h2>
            {addresses.length === 0 ? (
              <p className="text-gray-500">No addresses saved</p>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{address.first_name} {address.last_name}</h4>
                        <p className="text-sm text-gray-600">{address.address_line_1}</p>
                        <p className="text-sm text-gray-600">{address.city}, {address.state} {address.postal_code}</p>
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded mt-1">
                          {address.type}
                        </span>
                      </div>
                      {address.is_default && (
                        <span className="text-xs text-primary-600 font-medium">Default</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
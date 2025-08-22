import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, Navigate } from 'react-router-dom';

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
  const { user, supabase } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.email) { setLoading(false); return; }

      // Find customer by email
      const { data: customers } = await supabase
        .from('customers')
        .select('id')
        .eq('email', user.email)
        .limit(1);
      const customerId = customers?.[0]?.id;

      if (customerId) {
        const [{ data: ords }, { data: addrs }] = await Promise.all([
          supabase.from('orders')
            .select('id, order_number, status, total_amount, created_at')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false }),
          supabase.from('customer_addresses')
            .select('id, type, first_name, last_name, address_line_1, city, state, postal_code, is_default')
            .eq('customer_id', customerId)
            .order('is_default', { ascending: false })
        ]);
        setOrders(ords || []);
        setAddresses(addrs || []);
      }
      setLoading(false);
    };
    load();
  }, [user?.email, supabase]);

  if (!user && import.meta.env.PROD) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-serif font-bold mb-6">My Account</h1>
      {!user && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
          You're not signed in. In development you can still view demo data if available.
        </div>
      )}
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            {orders.length === 0 ? (
              <p className="text-gray-600">No orders yet.</p>
            ) : (
              <ul className="divide-y">
                {orders.map(o => (
                  <li key={o.id} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{o.order_number}</div>
                      <div className="text-sm text-gray-600">{new Date(o.created_at).toLocaleString()} • {o.status}</div>
                    </div>
                    <div className="font-semibold">₹{o.total_amount?.toLocaleString?.() || o.total_amount}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Addresses</h2>
            {addresses.length === 0 ? (
              <p className="text-gray-600">No saved addresses.</p>
            ) : (
              <ul className="space-y-3">
                {addresses.map(a => (
                  <li key={a.id} className="p-3 rounded border">
                    <div className="text-sm text-gray-500 mb-1">{a.type} {a.is_default ? '(default)' : ''}</div>
                    <div className="font-medium">{a.first_name} {a.last_name}</div>
                    <div className="text-gray-700">{a.address_line_1}</div>
                    <div className="text-gray-700">{a.city}, {a.state} {a.postal_code}</div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <Link to="/checkout" className="text-primary-600 hover:underline text-sm">Add new address at checkout</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;

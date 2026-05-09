import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getOrderHistory } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import StudentHeader from '../../components/StudentHeader';

const STATUS_COLORS = {
  PENDING: '#737373',
  PREPARING: '#f59e0b',
  READY: '#22c55e',
  PICKED_UP: '#a3a3a3',
};

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.rollNumber) return;
    getOrderHistory(user.rollNumber)
      .then(setOrders)
      .catch(() => setError('Could not load order history.'))
      .finally(() => setLoading(false));
  }, [user?.rollNumber]);

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-svh flex flex-col" style={{ background: '#0a0a0a' }}>
      <StudentHeader />
      <div className="max-w-2xl mx-auto px-4 py-8 flex-1 w-full">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white mb-1">Order History</h1>
          <p className="text-gray-500 text-sm">
            {user ? `Roll No: ${user.rollNumber}` : ''}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-gray-500 mb-4">No past orders yet.</p>
            <a
              href="#/student/menu"
              className="px-6 py-2 rounded-xl font-bold text-black transition-all hover:brightness-110"
              style={{ background: '#f59e0b' }}
            >
              Browse Menu
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-2xl font-black font-mono text-amber-accent">#{order.token}</span>
                    <p className="text-gray-500 text-xs mt-1">{formatDate(order.created_at)}</p>
                  </div>
                  <div
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                    style={{
                      background: `${STATUS_COLORS[order.status] || '#737373'}20`,
                      color: STATUS_COLORS[order.status] || '#737373'
                    }}
                  >
                    {order.status?.replace('_', ' ')}
                  </div>
                </div>
                <div className="space-y-1 mb-3">
                  {(order.items || []).map((item, idx) => (
                    <p key={idx} className="text-gray-300 text-sm">
                      {item.name}{item.quantity || item.qty ? ` x${item.quantity || item.qty}` : ''}
                    </p>
                  ))}
                </div>
                <div className="border-t border-white/5 pt-3 flex justify-between font-bold">
                  <span className="text-gray-400">Total</span>
                  <span className="text-amber-accent">₹{order.total_amount}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
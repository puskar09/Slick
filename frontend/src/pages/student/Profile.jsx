import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getOrderHistory, apiClient } from '../../api/client';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import StudentHeader from '../../components/StudentHeader';

const STATUS_COLORS = {
  PENDING: '#737373',
  PREPARING: '#f59e0b',
  READY: '#22c55e',
  PICKED_UP: '#a3a3a3',
};

const STATUS_INDICATORS = {
  PENDING: { color: '#737373', bg: 'rgba(115,115,115,0.15)', message: 'Waiting for payment' },
  PAID: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', message: 'Being prepared' },
  PREPARING: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', message: 'Being prepared' },
  READY: { color: '#22c55e', bg: 'rgba(34,197,94,0.15)', message: 'Ready for Pickup' },
  PICKED_UP: { color: '#a3a3a3', bg: 'rgba(163,163,163,0.1)', message: 'Completed' },
};

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const setLastToken = useCartStore((s) => s.setLastToken);
  const [orders, setOrders] = useState([]);
  const [liveOrder, setLiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  useEffect(() => {
    if (!user?.rollNumber) return;
    getOrderHistory(user.rollNumber)
      .then((data) => {
        setOrders(data);
        const active = data.find((o) => o.status?.toUpperCase() !== 'PICKED_UP');
        if (active) {
          setLiveOrder(active);
        }
      })
      .catch(() => setError('Could not load order history.'))
      .finally(() => setLoading(false));
  }, [user?.rollNumber]);

  useEffect(() => {
    if (!liveOrder) return;

    const fetchLive = () => {
      apiClient.get(`/orders/${liveOrder.token}`).then((r) => {
        const updated = r.data;
        setLiveOrder(updated);
        if (updated.status?.toUpperCase() === 'PICKED_UP') {
          setOrders((prev) =>
            prev.map((o) => o.token === updated.token ? updated : o)
          );
          setLiveOrder(null);
          clearInterval(pollRef.current);
        }
      }).catch(() => {});
    };

    pollRef.current = setInterval(fetchLive, 5000);
    return () => clearInterval(pollRef.current);
  }, [liveOrder?.token]);

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const historyOrders = orders.filter((o) => o.token !== liveOrder?.token);

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
        ) : (
          <div className="space-y-4">
            {liveOrder && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-5"
                style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black font-mono text-amber-accent">#{liveOrder.token}</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-black uppercase"
                      style={{ background: '#22c55e' }}
                    >
                      LIVE
                    </span>
                  </div>
                  {(() => {
                    const ind = STATUS_INDICATORS[liveOrder.status?.toUpperCase()] || STATUS_INDICATORS.PENDING;
                    return (
                      <div
                        className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"
                        style={{ background: ind.bg, color: ind.color }}
                      >
                        {liveOrder.status?.toUpperCase() !== 'PICKED_UP' && (
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ind.color }} />
                        )}
                        {ind.message}
                      </div>
                    );
                  })()}
                </div>
                <div className="space-y-1 mb-3">
                  {(liveOrder.items || []).map((item, idx) => (
                    <p key={idx} className="text-gray-300 text-sm">
                      {item.name}{item.quantity || item.qty ? ` x${item.quantity || item.qty}` : ''}
                    </p>
                  ))}
                </div>
                <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                  <span className="text-gray-400 font-bold">₹{liveOrder.total_amount}</span>
                  <a
                    href="#/student/status"
                    className="px-4 py-2 rounded-xl font-bold text-sm text-black transition-all hover:brightness-110"
                    style={{ background: '#22c55e' }}
                    onClick={() => setLastToken(liveOrder.token)}
                  >
                    Track Live →
                  </a>
                </div>
              </motion.div>
            )}

            {historyOrders.length === 0 && !liveOrder && (
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
            )}

            {historyOrders.map((order) => (
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
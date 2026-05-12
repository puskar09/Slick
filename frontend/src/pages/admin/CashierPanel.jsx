import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToOrders, confirmPayment, getOrders } from '../../api/client';
import AdminHeader from '../../components/AdminHeader';
import Toast from '../../components/Toast';

export default function CashierPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef(null);
  const esRef = useRef(null);
  const pollRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 3000);
  };

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders((prev) => {
        const merged = [...prev, ...data];
        const seen = new Set();
        return merged.filter((o) => {
          if (seen.has(o.token)) return false;
          seen.add(o.token);
          return true;
        });
      });
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    esRef.current = subscribeToOrders((data) => {
      if (Array.isArray(data)) {
        setOrders((prev) => {
          const merged = [...prev, ...data];
          const seen = new Set();
          return merged.filter((o) => {
            if (seen.has(o.token)) return false;
            seen.add(o.token);
            return true;
          });
        });
      }
    });

    pollRef.current = setInterval(loadOrders, 5000);

    return () => {
      esRef.current?.close();
      clearInterval(pollRef.current);
    };
  }, []);

  const pending = orders.filter((o) => o.status?.toLowerCase() === 'pending');

  const handleConfirm = async (token) => {
    if (confirming !== null) return;
    setConfirming(token);
    setOrders((prev) =>
      prev.map((o) => o.token === token ? { ...o, status: 'preparing', _pending: true } : o)
    );
    try {
      await confirmPayment(token);
      showToast(`Token #${token} sent to kitchen`);
    } catch (e) {
      setOrders((prev) =>
        prev.map((o) => o.token === token ? { ...o, status: 'pending', _pending: false } : o)
      );
      showToast(e?.response?.data?.detail || 'Failed to confirm order');
    } finally {
      setConfirming(null);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '--';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-svh flex flex-col" style={{ background: '#0a0a0a' }}>
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Cashier Panel</h1>
            <p className="text-gray-500 text-sm">Confirm orders and send to kitchen</p>
          </div>
          <div
            className="rounded-2xl px-6 py-4 text-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pending Orders</p>
            <p className="text-3xl font-black" style={{ color: '#f59e0b' }}>{pending.length}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pending.length === 0 ? (
          <div
            className="rounded-2xl p-16 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-gray-500 text-lg">No pending orders right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {pending.map((order) => (
                <motion.div
                  key={order.id || order.token}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl p-6"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <span className="text-5xl font-black font-mono text-amber-accent">#{order.token}</span>
                    <span className="text-gray-500 text-sm font-mono">{formatTime(order.created_at)}</span>
                  </div>

                  <div className="space-y-2 mb-5 min-h-[56px]">
                    {(order.items || []).map((item, idx) => (
                      <p key={idx} className="text-white text-sm leading-snug">
                        {item.name}{item.quantity || item.qty ? ` x${item.quantity || item.qty}` : ''}
                      </p>
                    ))}
                  </div>

                  <div className="border-t border-white/5 pt-4 mb-5">
                    <span className="text-2xl font-bold text-amber-accent">₹{order.total_amount}</span>
                  </div>

                  {order._pending ? (
                    <div className="text-center py-3">
                      <span className="text-green-400 text-sm font-semibold">✓ Sent to kitchen</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConfirm(order.token)}
                      disabled={confirming === order.token}
                      className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: confirming === order.token ? '#b45309' : '#f59e0b' }}
                    >
                      {confirming === order.token ? 'Confirming...' : 'Confirm Payment'}
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {toastMsg && <Toast message={toastMsg} />}
      </AnimatePresence>
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToOrders, apiClient } from '../../api/client';
import { useCartStore } from '../../store/useCartStore';
import StudentHeader from '../../components/StudentHeader';

const STATUS_CONFIG = {
  PENDING: {
    message: 'Waiting confirmation until paid.',
    color: '#737373',
    bg: 'rgba(115,115,115,0.15)',
    pulse: false,
  },
  PREPARING: {
    message: 'Getting ready. (Estimated wait: 5 to 10 minutes)',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.15)',
    pulse: true,
  },
  READY: {
    message: 'Already ready! Please pick up at the counter.',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.15)',
    pulse: true,
  },
  PICKED_UP: {
    message: 'Order completed.',
    color: '#a3a3a3',
    bg: 'rgba(163,163,163,0.1)',
    pulse: false,
  },
};

export default function OrderStatus() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [searched, setSearched] = useState(false);
  const pollRef = useRef(null);
  const esRef = useRef(null);

  const lastToken = useCartStore((s) => s.lastToken);
  const setLastToken = useCartStore((s) => s.setLastToken);

  const fetchOrder = async (token) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await apiClient.get(`/orders/${token}`).then((r) => r.data);
      setOrder(data);
    } catch {
      setError('Could not load order status. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lastToken && !searched) {
      setInputVal(String(lastToken));
      setSearched(true);
      fetchOrder(lastToken);
    }
  }, []);

  useEffect(() => {
    if (order?.status === 'PICKED_UP') {
      clearInterval(pollRef.current);
      return;
    }
    if (order?.token) {
      pollRef.current = setInterval(() => fetchOrder(order.token), 3000);
    }
    return () => clearInterval(pollRef.current);
  }, [order?.token, order?.status]);

  useEffect(() => {
    esRef.current = subscribeToOrders((data) => {
      if (!Array.isArray(data) || !order?.token) return;
      const updated = data.find((o) => o.token === order.token);
      if (updated && updated.status !== order.status) {
        setOrder(updated);
      }
    });
    return () => esRef.current?.close();
  }, [order?.token]);

  const handleSearch = () => {
    const t = parseInt(inputVal);
    if (!t) return;
    setLastToken(t);
    setSearched(true);
    setOrder(null);
    fetchOrder(t);
  };

  const cfg = order ? (STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING) : null;

  return (
    <div className="min-h-svh flex flex-col" style={{ background: '#0a0a0a' }}>
      <StudentHeader />
      <div className="max-w-md mx-auto px-4 py-6 flex-1 w-full">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white mb-6"
        >
          Order Status
        </motion.h1>

        <div className="flex gap-2 mb-6">
          <input
            type="number"
            placeholder="Enter your token number"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-400/50 transition-colors"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            className="px-6 py-2.5 rounded-xl font-bold text-black transition-colors"
            style={{ background: '#f59e0b' }}
          >
            Track
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl p-4 text-center mb-4"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <p className="text-red-400 font-medium text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!loading && order && cfg && (
            <motion.div
              key={order.token}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="text-center mb-6">
                <span className="text-6xl font-black font-mono text-amber-accent">#{order.token}</span>
              </div>

              <div
                className="rounded-xl p-4 mb-6 text-center flex items-center justify-center gap-2"
                style={{ background: cfg.bg }}
              >
                {cfg.pulse && (
                  <span
                    className="inline-block w-2 h-2 rounded-full animate-pulse"
                    style={{ background: cfg.color }}
                  />
                )}
                <span className="font-semibold text-sm" style={{ color: cfg.color }}>
                  {cfg.message}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span className="text-white">{item.name || item}</span>
                    <span className="text-gray-500">x{item.quantity || item.qty || 1}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-white">
                <span>Total</span>
                <span className="text-amber-accent">₹{order.total}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && !order && !error && !searched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <p className="text-gray-500 text-sm">Enter your token number above to track your order</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
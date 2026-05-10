import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToOrders, apiClient, submitRating } from '../../api/client';
import { useCartStore } from '../../store/useCartStore';
import StudentHeader from '../../components/StudentHeader';
import Toast from '../../components/Toast';

const STATUS_CONFIG = {
  pending: {
    message: 'Waiting for payment confirmation.',
    color: '#737373',
    bg: 'rgba(115,115,115,0.15)',
    pulse: false,
  },
  paid: {
    message: 'Being prepared in kitchen.',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.15)',
    pulse: true,
  },
  preparing: {
    message: 'Being prepared in kitchen.',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.15)',
    pulse: true,
  },
  ready: {
    message: 'Ready for Pickup!',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.15)',
    pulse: true,
  },
  picked_up: {
    message: 'Order completed',
    color: '#a3a3a3',
    bg: 'rgba(163,163,163,0.1)',
    pulse: false,
  },
};

const RATED_KEY = 'slick-rated-tokens';

function getRatedTokens() {
  try {
    return JSON.parse(localStorage.getItem(RATED_KEY) || '[]');
  } catch {
    return [];
  }
}

function markTokenRated(token) {
  const rated = getRatedTokens();
  if (!rated.includes(token)) {
    rated.push(token);
    localStorage.setItem(RATED_KEY, JSON.stringify(rated));
  }
}

export default function OrderStatus() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [searched, setSearched] = useState(false);
  const [ratedItems, setRatedItems] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const pollRef = useRef(null);
  const esRef = useRef(null);
  const toastTimer = useRef(null);
  const prevStatusRef = useRef(null);

  const lastToken = useCartStore((s) => s.lastToken);
  const setLastToken = useCartStore((s) => s.setLastToken);

  const showToast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchOrder = async (token) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await apiClient.get(`/orders/${token}`).then((r) => r.data);
      const newStatus = data.status;
      if (prevStatusRef.current && prevStatusRef.current !== newStatus) {
        console.log(`[OrderStatus] Status changed: ${prevStatusRef.current} → ${newStatus} for token ${token}`);
      }
      prevStatusRef.current = newStatus;
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
    if (!order?.token) return;

    if (order?.status === 'picked_up') {
      clearInterval(pollRef.current);
      return;
    }

    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchOrder(order.token), 2000);

    return () => clearInterval(pollRef.current);
  }, [order?.token]);

  useEffect(() => {
    esRef.current = subscribeToOrders((data) => {
      if (!Array.isArray(data) || !order?.token) return;
      const updated = data.find((o) => o.token === order.token);
      if (updated && updated.status !== order.status) {
        console.log(`[OrderStatus] SSE update received: token=${order.token}, old=${order.status}, new=${updated.status}`);
        prevStatusRef.current = updated.status;
        setOrder(updated);
      }
    });
    return () => esRef.current?.close();
  }, [order?.token, order?.status]);

  const handleSearch = () => {
    const t = parseInt(inputVal);
    if (!t) return;
    setLastToken(t);
    setSearched(true);
    setOrder(null);
    setRatedItems({});
    prevStatusRef.current = null;
    fetchOrder(t);
  };

  const handleRate = async (menuItemId, itemName, rating) => {
    if (!order?.token || submitting) return;
    setSubmitting(true);
    try {
      const payload = { menu_item_id: menuItemId, token_number: order.token, rating, name: itemName };
      await submitRating(payload.menu_item_id, payload.token_number, rating, payload.name);
      setRatedItems((prev) => ({ ...prev, [itemName]: rating }));
      markTokenRated(order.token);
    } catch (e) {
      console.error('Rating failed:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const cfg = order ? (STATUS_CONFIG[order.status?.toLowerCase()] || STATUS_CONFIG.pending) : null;
  const isPickedUp = order?.status?.toLowerCase() === 'picked_up';
  const ratedTokens = getRatedTokens();
  const alreadyRated = isPickedUp && ratedTokens.includes(order?.token);
  const allItemsRated = order?.items?.length > 0 && order.items.every((item) => ratedItems[item.name || item] !== undefined);

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

        <AnimatePresence>
          {isPickedUp && !loading && order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-6 mt-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {alreadyRated && allItemsRated ? (
                <div className="text-center py-2">
                  <p className="text-amber-accent font-bold text-base mb-1">Thanks for your feedback! ⭐</p>
                  <p className="text-gray-500 text-sm">Your ratings help us improve.</p>
                </div>
              ) : (
                <>
                  <p className="text-white font-bold text-base mb-4 text-center">How was your order?</p>
                  <div className="space-y-3">
                    {(order.items || []).map((item, idx) => {
                      const itemName = item.name || item;
                      const menuItemId = item.menu_item_id || 0;
                      const existing = ratedItems[itemName];
                      return (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">{itemName}</span>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRate(menuItemId, itemName, 1)}
                              disabled={submitting || existing !== undefined}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                                existing === 1
                                  ? 'bg-green-500 text-white'
                                  : 'hover:bg-green-500/20 text-green-400'
                              }`}
                              style={existing === 1 ? {} : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                              👍
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRate(menuItemId, itemName, 0)}
                              disabled={submitting || existing !== undefined}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                                existing === 0
                                  ? 'bg-red-500 text-white'
                                  : 'hover:bg-red-500/20 text-red-400'
                              }`}
                              style={existing === 0 ? {} : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                              👎
                            </motion.button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
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

      <AnimatePresence>
        {toastMsg && <Toast message={toastMsg} />}
      </AnimatePresence>
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToOrders, markReady, markPickedUp, getOrders } from '../../api/client';
import AdminHeader from '../../components/AdminHeader';
import Toast from '../../components/Toast';

function elapsed(ts) {
  if (!ts) return '0m';
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  return diff < 60 ? `${diff}s` : `${Math.floor(diff / 60)}m`;
}

export default function KitchenPanel() {
  const [orders, setOrders] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef(null);
  const esRef = useRef(null);
  const pollRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 3000);
  };

  const loadOrders = () => {
    getOrders().then((data) => {
      const unique = Array.from(new Map(data.map((o) => [o.token, o])).values());
      setOrders(unique);
    }).catch(console.error);
  };

  useEffect(() => {
    loadOrders();

    esRef.current = subscribeToOrders((data) => {
      if (Array.isArray(data)) {
        const unique = Array.from(new Map(data.map((o) => [o.token, o])).values());
        setOrders(unique);
      }
    });

    pollRef.current = setInterval(loadOrders, 3000);

    return () => {
      esRef.current?.close();
      clearInterval(pollRef.current);
    };
  }, []);

  const preparing = orders.filter((o) => ['paid', 'preparing'].includes(o.status?.toLowerCase()));

  const handleReady = async (token) => {
    setOrders((prev) =>
      prev.map((o) => o.token === token ? { ...o, status: 'ready' } : o)
    );
    try {
      await markReady(token);
      showToast(`Token #${token} marked ready`);
    } catch (e) {
      loadOrders();
      showToast(e?.response?.data?.detail || 'Failed to mark ready');
    }
  };
  const ready = orders.filter((o) => o.status?.toLowerCase() === 'ready');

  const handlePickup = async (token) => {
    setOrders((prev) =>
      prev.map((o) => o.token === token ? { ...o, status: 'picked_up' } : o)
    );
    try {
      await markPickedUp(token);
      showToast(`Token #${token} picked up`);
    } catch (e) {
      loadOrders();
      showToast(e?.response?.data?.detail || 'Failed to mark picked up');
    }
  };

  const renderCard = (order, type) => (
    <motion.div
      key={order.id || order.token}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderLeft: `4px solid ${type === 'paid' ? '#f59e0b' : '#22c55e'}`
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-4xl font-black font-mono text-amber-accent">#{order.token}</span>
        <span className="text-gray-500 text-xs font-mono">{elapsed(order.created_at)} ago</span>
      </div>
      <div className="space-y-1 mb-5 min-h-[40px]">
        {(order.items || []).map((item, idx) => (
          <p key={idx} className="text-white text-sm">
            {item.name || item}{item.quantity || item.qty ? ` x${item.quantity || item.qty}` : ''}
          </p>
        ))}
      </div>
      {type === 'paid' ? (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => handleReady(order.token)}
          className="w-full py-3 rounded-xl font-bold text-black text-sm transition-all hover:brightness-110"
          style={{ background: '#f59e0b' }}
        >
          Mark as Ready
        </motion.button>
      ) : (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => handlePickup(order.token)}
          className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:bg-green-600"
          style={{ background: '#22c55e' }}
        >
          Mark as Picked Up
        </motion.button>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-svh flex flex-col" style={{ background: '#0a0a0a' }}>
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Kitchen Panel</h1>
            <p className="text-gray-500 text-sm">Manage orders by token number</p>
          </div>
          <div className="flex gap-4">
            <div
              className="rounded-2xl px-6 py-4 text-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cooking</p>
              <p className="text-3xl font-black" style={{ color: '#f59e0b' }}>{preparing.length}</p>
            </div>
            <div
              className="rounded-2xl px-6 py-4 text-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Ready</p>
              <p className="text-3xl font-black text-green-400">{ready.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div
              className="rounded-t-2xl px-6 py-3 font-bold text-sm uppercase tracking-wider text-center mb-0"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', borderBottom: 'none' }}
            >
              Preparing ({preparing.length})
            </div>
            <div className="border rounded-b-2xl rounded-t-none p-5" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
              {preparing.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No orders being prepared</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {preparing.map((o) => renderCard(o, 'paid'))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          <div>
            <div
              className="rounded-t-2xl px-6 py-3 font-bold text-sm uppercase tracking-wider text-center mb-0"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', borderBottom: 'none' }}
            >
              Ready for Pickup ({ready.length})
            </div>
            <div className="border rounded-b-2xl rounded-t-none p-5" style={{ borderColor: 'rgba(34,197,94,0.2)' }}>
              {ready.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No orders ready for pickup</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {ready.map((o) => renderCard(o, 'ready'))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toastMsg && <Toast message={toastMsg} />}
      </AnimatePresence>
    </div>
  );
}
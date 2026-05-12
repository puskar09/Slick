import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getOrderHistory, apiClient } from '../../api/client';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import StudentHeader from '../../components/StudentHeader';

const STEPS = ['Ordered', 'Paid', 'Preparing', 'Ready', 'Picked Up'];

const STATUS_STEP = {
  pending: 0,
  paid: 1,
  preparing: 2,
  ready: 3,
  picked_up: 4,
};

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const lastToken = useCartStore((s) => s.lastToken);
  const setLastToken = useCartStore((s) => s.setLastToken);
  const [activeOrder, setActiveOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  useEffect(() => {
    if (!user?.rollNumber) {
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const historyData = await getOrderHistory(user.rollNumber);
        const pickedUp = (historyData || []).filter((o) =>
          o.status?.toUpperCase() === 'PICKED_UP'
        );
        setHistory(pickedUp);

        if (lastToken) {
          const activeData = (await apiClient.get(`/orders/${lastToken}`).catch(() => ({ data: null }))).data;
          if (activeData) {
            if (activeData.status?.toLowerCase() !== 'picked_up') {
              setActiveOrder(activeData);
            } else {
              setLastToken(null);
              setActiveOrder(null);
            }
          } else {
            setActiveOrder(null);
          }
        } else {
          setActiveOrder(null);
        }
      } catch (e) {
        setError('Could not load account data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();

    if (lastToken) {
      pollRef.current = setInterval(async () => {
        try {
          const o = (await apiClient.get(`/orders/${lastToken}`)).data;
          if (o.status?.toLowerCase() === 'picked_up') {
            setLastToken(null);
            setActiveOrder(null);
            clearInterval(pollRef.current);
            const historyData = await getOrderHistory(user.rollNumber);
            setHistory((prev) => {
              const existing = prev.some((h) => h.token === o.token);
              if (existing) return prev;
              return [o, ...prev];
            });
          } else {
            setActiveOrder(o);
          }
        } catch {}
      }, 5000);
    }

    return () => clearInterval(pollRef.current);
  }, [user?.rollNumber, lastToken]);

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const activeStep = activeOrder
    ? (STATUS_STEP[activeOrder.status?.toLowerCase()] ?? 0)
    : -1;

  return (
    <div className="min-h-svh flex flex-col" style={{ background: '#0a0a0a' }}>
      <StudentHeader />
      <div className="max-w-2xl mx-auto px-4 py-8 flex-1 w-full">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white mb-1">My Account</h1>
          <p className="text-gray-500 text-sm">
            {user ? `Roll No: ${user.rollNumber}` : ''}
          </p>
        </motion.div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            Active Order
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !activeOrder ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-gray-600 text-sm">No active orders</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}
            >
              <div className="text-center mb-6">
                <span className="text-6xl font-black font-mono text-amber-accent">#{activeOrder.token}</span>
              </div>

              <div className="flex gap-1 mb-5">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-1 rounded-full transition-all duration-300"
                    style={{ background: i <= activeStep ? '#f59e0b' : 'rgba(255,255,255,0.1)' }}
                  />
                ))}
              </div>

              <div className="flex justify-between mb-5">
                {STEPS.map((step, i) => {
                  const isActive = i === activeStep;
                  return (
                    <div key={step} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${isActive ? 'animate-pulse' : ''}`}
                        style={{
                          background: i <= activeStep ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                          color: i <= activeStep ? '#000' : '#555',
                        }}
                      >
                        {i <= activeStep ? (i === activeStep ? '●' : '✓') : ''}
                      </div>
                      <span className="text-[8px] font-semibold text-center" style={{ color: i <= activeStep ? '#f59e0b' : '#555' }}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div
                className="rounded-xl p-3 mb-5 text-center"
                style={{ background: 'rgba(245,158,11,0.1)' }}
              >
                <span className="text-amber-accent font-semibold text-sm">
                  {activeOrder.status?.toLowerCase() === 'pending' && '⏳ Waiting for payment'}
                  {activeOrder.status?.toLowerCase() === 'paid' && '🔥 Being prepared in kitchen'}
                  {activeOrder.status?.toLowerCase() === 'preparing' && '🔥 Being prepared in kitchen'}
                  {activeOrder.status?.toLowerCase() === 'ready' && '✅ Ready for pickup!'}
                </span>
              </div>

              <div className="space-y-1 mb-5">
                {(activeOrder.items || []).map((item, idx) => (
                  <p key={idx} className="text-gray-300 text-sm">
                    {item.name}{item.quantity || item.qty ? ` x${item.quantity || item.qty}` : ''}
                  </p>
                ))}
              </div>

              <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                <span className="text-gray-400 font-bold">₹{activeOrder.total}</span>
                <a
                  href="#/student/status"
                  className="px-4 py-2 rounded-xl font-bold text-sm text-black transition-all hover:brightness-110"
                  style={{ background: '#f59e0b' }}
                >
                  Go to Tracker →
                </a>
              </div>
            </motion.div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-4">Order History</h2>

          {history.length === 0 && !loading && (
            <div
              className="rounded-2xl p-10 text-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-gray-500 mb-4">No completed orders yet.</p>
              <a
                href="#/student/menu"
                className="px-6 py-2 rounded-xl font-bold text-black transition-all hover:brightness-110"
                style={{ background: '#f59e0b' }}
              >
                Browse Menu
              </a>
            </div>
          )}

          {history.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4 mb-3"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black font-mono text-amber-accent">#{order.token}</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
                    style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
                  >
                    Completed
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs">{formatDate(order.created_at)}</p>
                  <p className="text-gray-600 text-xs">{formatTime(order.created_at)}</p>
                </div>
              </div>
              <div className="space-y-0.5 mb-2">
                {(order.items || []).map((item, idx) => (
                  <p key={idx} className="text-gray-400 text-xs">
                    {item.name}{item.quantity || item.qty ? ` x${item.quantity || item.qty}` : ''}
                  </p>
                ))}
              </div>
              <div className="border-t border-white/5 pt-2 flex justify-between font-bold">
                <span className="text-gray-400 text-sm">Total</span>
                <span className="text-amber-accent text-sm">₹{order.total_amount}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
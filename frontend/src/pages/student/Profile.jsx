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

const STATUS_COLORS = {
  PENDING: '#737373',
  PREPARING: '#f59e0b',
  PAID: '#f59e0b',
  READY: '#22c55e',
  PICKED_UP: '#a3a3a3',
};

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const lastToken = useCartStore((s) => s.lastToken);
  const setLastToken = useCartStore((s) => s.setLastToken);
  const [activeOrder, setActiveOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  useEffect(() => {
    if (!user?.rollNumber) return;
    getOrderHistory(user.rollNumber)
      .then((data) => {
        setOrders(data.filter((o) => o.status?.toUpperCase() === 'PICKED_UP'));
        if (lastToken) {
          apiClient.get(`/orders/${lastToken}`).then((r) => {
            const o = r.data;
            if (o.status?.toLowerCase() !== 'picked_up') {
              setActiveOrder(o);
            } else {
              setLastToken(null);
            }
          }).catch(() => {});
        }
      })
      .catch(() => setError('Could not load order history.'))
      .finally(() => setLoading(false));
  }, [user?.rollNumber, lastToken]);

  useEffect(() => {
    if (!activeOrder) return;

    const fetchLive = () => {
      apiClient.get(`/orders/${activeOrder.token}`).then((r) => {
        const o = r.data;
        setActiveOrder(o);
        if (o.status?.toLowerCase() === 'picked_up') {
          setOrders((prev) => [o, ...prev]);
          setActiveOrder(null);
          setLastToken(null);
          clearInterval(pollRef.current);
        }
      }).catch(() => {});
    };

    pollRef.current = setInterval(fetchLive, 3000);
    return () => clearInterval(pollRef.current);
  }, [activeOrder?.token]);

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

              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  {STEPS.map((step, i) => {
                    const isDone = i < activeStep;
                    const isActive = i === activeStep;
                    const color = isDone || isActive ? '#f59e0b' : 'rgba(255,255,255,0.15)';
                    return (
                      <div key={step} className="flex flex-col items-center gap-1 flex-1">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'animate-pulse' : ''}`}
                          style={{
                            background: isDone ? '#22c55e' : isActive ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                            color: isDone || isActive ? '#000' : '#555',
                          }}
                        >
                          {isDone ? '✓' : i + 1}
                        </div>
                        <span className="text-[9px] font-semibold text-center" style={{ color: isDone || isActive ? '#f59e0b' : '#555' }}>
                          {step}
                        </span>
                        {i < STEPS.length - 1 && (
                          <div
                            className="absolute h-0.5 w-full -translate-y-3"
                            style={{ background: i < activeStep ? '#22c55e' : 'rgba(255,255,255,0.1)' }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-1">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full transition-all duration-300"
                      style={{ background: i <= activeStep ? '#f59e0b' : 'rgba(255,255,255,0.1)' }}
                    />
                  ))}
                </div>
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

          {orders.length === 0 && !loading ? (
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
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-4"
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
          )}
        </div>
      </div>
    </div>
  );
}
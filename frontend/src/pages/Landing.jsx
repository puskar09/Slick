import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useCartStore } from '../store/useCartStore';
import { apiClient } from '../api/client';

const ACCESS_CODES = {
  '0000': '#/student/menu',
  '1111': '#/admin/cashier',
};

const BANNER_STATUS = {
  pending: { text: '⏳ Order #{token} — Waiting for payment', color: '#737373', bg: 'rgba(115,115,115,0.1)', pulse: false },
  paid: { text: '🔥 Order #{token} — Being prepared', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', pulse: true },
  preparing: { text: '🔥 Order #{token} — Being prepared', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', pulse: true },
  ready: { text: '✅ Order #{token} — Ready for Pickup!', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', pulse: true },
  picked_up: { text: null, color: null, bg: null, pulse: false },
};

export default function Landing() {
  const [showInput, setShowInput] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const lastToken = useCartStore((s) => s.lastToken);
  const setLastToken = useCartStore((s) => s.setLastToken);
  const [activeOrder, setActiveOrder] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!lastToken) {
      setActiveOrder(null);
      clearInterval(pollRef.current);
      return;
    }

    const fetchActive = () => {
      apiClient.get(`/orders/${lastToken}`).then((r) => {
        const order = r.data;
        const status = order.status?.toLowerCase();
        if (status === 'picked_up') {
          setLastToken(null);
          setActiveOrder(null);
          clearInterval(pollRef.current);
        } else {
          setActiveOrder(order);
        }
      }).catch(() => {});
    };

    fetchActive();
    pollRef.current = setInterval(fetchActive, 5000);

    return () => clearInterval(pollRef.current);
  }, [lastToken]);

  const handleSubmit = () => {
    if (ACCESS_CODES[code]) {
      window.location.hash = ACCESS_CODES[code];
      setShowInput(false);
      setCode('');
      setError('');
    } else {
      setError('Invalid Access Code');
    }
  };

  const bannerCfg = activeOrder ? (BANNER_STATUS[activeOrder.status?.toLowerCase()] || BANNER_STATUS.pending) : null;

  return (
    <PageTransition>
      <div
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: '#0a0a0a' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(245,158,11,0.08) 0%, transparent 70%)',
          }}
        />

        <div
          className="absolute w-[500px] h-[500px] rounded-full animate-pulse pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animationDuration: '4s',
          }}
        />

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-8"
          >
            <UtensilsCrossed size={56} className="mx-auto text-amber-accent mb-4" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="text-7xl md:text-9xl font-black mb-4 tracking-tighter"
            style={{
              color: '#f59e0b',
              textShadow: '0 0 40px rgba(245,158,11,0.5), 0 0 80px rgba(245,158,11,0.3), 0 0 120px rgba(245,158,11,0.15)',
            }}
          >
            SLICK
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-text-secondary text-lg md:text-xl font-light mb-12 tracking-wide"
          >
            Campus canteen. Reimagined.
          </motion.p>

          {!showInput ? (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowInput(true)}
              className="px-8 py-3.5 rounded-xl font-bold text-black text-base transition-all hover:scale-[1.02]"
              style={{ background: '#f59e0b' }}
            >
              Enter Access Code
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="max-w-xs mx-auto"
            >
              <div
                className="rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-gray-400 text-sm mb-4 text-center">Enter your access code to continue</p>
                <input
                  type="password"
                  maxLength={4}
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="****"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-center text-2xl tracking-[0.5em] font-mono placeholder:text-gray-700 focus:outline-none focus:border-amber-400/50 transition-colors mb-3"
                  autoFocus
                />
                {error && (
                  <p className="text-red-400 text-sm text-center mb-3">{error}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-2.5 rounded-xl font-bold text-sm text-black transition-all hover:brightness-110"
                    style={{ background: '#f59e0b' }}
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => { setShowInput(false); setCode(''); setError(''); }}
                    className="px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {bannerCfg && activeOrder && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-4"
            >
              <div
                className="rounded-2xl p-5 text-center"
                style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${bannerCfg.color}40` }}
              >
                <p className="text-sm font-semibold mb-3" style={{ color: bannerCfg.color }}>
                  You have an active order #{activeOrder.token}
                </p>
                <div className="flex gap-2 justify-center">
                  <a
                    href="#/student/status"
                    className="flex-1 py-2.5 rounded-xl font-bold text-sm text-black transition-all hover:brightness-110"
                    style={{ background: bannerCfg.color }}
                  >
                    Track Order
                  </a>
                  <a
                    href="#/student/menu"
                    className="px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-400 hover:text-white transition-colors border border-white/10"
                  >
                    Browse Menu
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
          }
          .animate-pulse { animation: pulse 4s ease-in-out infinite; }
        `}</style>
      </div>
    </PageTransition>
  );
}
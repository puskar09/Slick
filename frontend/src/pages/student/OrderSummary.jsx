import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { createOrder } from '../../api/client';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import StudentHeader from '../../components/StudentHeader';
import LoginModal from '../../components/LoginModal';
import CheckoutModal from '../../components/CheckoutModal';

export default function OrderSummary() {
  const cartItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const getTotal = useCartStore((s) => s.getTotal);
  const setLastToken = useCartStore((s) => s.setLastToken);
  const user = useAuthStore((s) => s.user);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const total = getTotal();
  const tax = Math.round(total * 0.05);
  const grandTotal = total + tax;

  const submitOrder = async (paymentMethod) => {
    setShowCheckout(false);
    if (!user) { setShowLogin(true); return; }
    if (cartItems.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const payload = {
        items: cartItems.map((i) => ({ menu_item_id: i.id, quantity: i.quantity, name: i.name, price: i.price })),
        payment_method: paymentMethod
      };
      const result = await createOrder(payload, user.rollNumber, paymentMethod);
      clearCart();
      setLastToken(result.token);
      setOrder(result);
    } catch (e) {
      setError('Failed to place order. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  if (order) {
    const qrData = JSON.stringify({ token: order.token, id: order.id || 1 });
    const isUPI = order.payment_method === 'upi';
    return (
      <div className="min-h-svh flex flex-col" style={{ background: '#0a0a0a' }}>
        <StudentHeader />
        <div className="max-w-md mx-auto px-4 py-10 flex-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
              className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl"
              style={{ background: 'rgba(34,197,94,0.15)' }}
            >
              ✓
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-1">Order Placed!</h2>
            <p className="text-gray-400 text-sm mb-6">
              {isUPI ? 'Payment received via UPI' : 'Pay at the counter when you pick up'}
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl p-5 inline-block mb-6"
              style={{ background: '#fff' }}
            >
              <QRCodeSVG value={qrData} size={160} bgColor="#ffffff" fgColor="#0a0a0a" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Your Token</p>
              <div
                className="inline-block rounded-xl px-8 py-3 border"
                style={{
                  borderColor: 'rgba(245,158,11,0.4)',
                  boxShadow: '0 0 20px rgba(245,158,11,0.2)',
                  background: 'rgba(245,158,11,0.08)',
                }}
              >
                <span className="text-6xl font-black font-mono text-amber-accent">#{order.token}</span>
              </div>
            </motion.div>

            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#f59e0b' }} />
              <span className="text-gray-400 text-sm">{
                order.status === 'PREPARING' ? 'Being prepared in kitchen' : 'Waiting for confirmation'
              }</span>
            </div>

            <a
              href="#/student/status"
              className="block w-full py-3 rounded-xl font-bold text-black text-center transition-all hover:brightness-110"
              style={{ background: '#f59e0b' }}
            >
              Track Order Status
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col" style={{ background: '#0a0a0a' }}>
      <StudentHeader />
      <div className="max-w-xl mx-auto px-4 py-6 flex-1 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Your Cart</h1>
          {cartItems.length > 0 && (
            <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-300 transition-colors">
              Clear Cart
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center flex flex-col items-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-gray-400 mb-4">Your cart is empty</p>
            <a
              href="#/student/menu"
              className="px-6 py-2 rounded-xl font-bold text-black transition-all hover:brightness-110"
              style={{ background: '#f59e0b' }}
            >
              Browse Menu
            </a>
          </div>
        ) : (
          <>
            <div
              className="rounded-2xl p-4 mb-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-4 border-b border-white/5 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{item.name}</p>
                    <p className="text-gray-400 text-sm">₹{item.price} per unit</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (item.quantity <= 1) removeItem(item.id);
                        else updateQty(item.id, item.quantity - 1);
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all hover:bg-white/10"
                      style={{ background: 'rgba(255,255,255,0.1)' }}
                    >
                      −
                    </button>
                    <span className="text-white font-bold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all hover:bg-white/10"
                      style={{ background: 'rgba(255,255,255,0.1)' }}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <p className="text-white font-bold">₹{item.price * item.quantity}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:text-red-300 transition-all"
                    style={{ background: 'rgba(239,68,68,0.1)' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div
              className="rounded-2xl p-5 mb-6"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span><span>₹{total}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax (5%)</span><span>₹{tax}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-amber-accent">₹{grandTotal}</span>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!user) setShowLogin(true);
                else setShowCheckout(true);
              }}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-black text-lg transition-all disabled:opacity-50"
              style={{ background: '#f59e0b' }}
            >
              {loading ? 'Placing Order...' : 'Checkout'}
            </motion.button>
          </>
        )}
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      <AnimatePresence>
        {showCheckout && (
          <CheckoutModal
            total={grandTotal}
            onUPI={() => submitOrder('upi')}
            onCash={() => submitOrder('cash')}
            onClose={() => setShowCheckout(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
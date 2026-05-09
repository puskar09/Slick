import { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

export default function CheckoutModal({ total, onUPI, onCash, onClose }) {
  const [upiProcessing, setUpiProcessing] = useState(false);

  const handleUPI = () => {
    setUpiProcessing(true);
    setTimeout(() => {
      setUpiProcessing(false);
      onUPI();
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={(e) => e.target === e.currentTarget && !upiProcessing && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <h2 className="text-xl font-bold text-white mb-1">Checkout</h2>
        <p className="text-gray-500 text-sm mb-6">Total: <span className="text-amber-accent font-bold">₹{total}</span></p>

        <div className="space-y-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleUPI}
            disabled={upiProcessing}
            className="w-full py-3.5 rounded-xl font-bold text-base text-white transition-all disabled:opacity-60 flex items-center justify-center gap-3"
            style={{ background: upiProcessing ? 'rgba(34,197,94,0.2)' : '#22c55e' }}
          >
            {upiProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing UPI...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                </svg>
                Pay via UPI
              </>
            )}
          </motion.button>

          {upiProcessing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-xl p-4 text-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <QRCodeSVG value={`slick-pay-${Date.now()}`} size={120} bgColor="#ffffff" fgColor="#0a0a0a" />
              <p className="text-gray-500 text-xs mt-2">Scan with any UPI app</p>
            </motion.div>
          )}

          <div className="relative flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-600 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onCash}
            disabled={upiProcessing}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-black transition-all disabled:opacity-40"
            style={{ background: '#f59e0b' }}
          >
            Pay Cash at Counter
          </motion.button>
        </div>

        {!upiProcessing && (
          <button
            onClick={onClose}
            className="w-full mt-3 py-2 text-gray-500 text-sm hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
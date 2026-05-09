import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Toast({ message }) {
  return (
    <motion.div
      key="toast"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl font-semibold text-sm text-black shadow-[0_0_30px_rgba(245,158,11,0.4)]"
      style={{ background: '#f59e0b' }}
    >
      {message}
    </motion.div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { login } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginModal({ onClose }) {
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rollNumber || !password) return;
    setLoading(true);
    setError('');
    try {
      const result = await login(rollNumber, password);
      setUser({ rollNumber: result.roll_number || rollNumber });
      onClose();
    } catch (e) {
      setError(e.response?.data?.detail || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-sm rounded-2xl p-6"
          style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <h2 className="text-xl font-bold text-white mb-1">Student Login</h2>
          <p className="text-gray-500 text-sm mb-6">Enter your roll number and password</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5">Roll Number</label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 12345"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-400/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Same as roll number"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-400/50 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              disabled={loading || !rollNumber || !password}
              className="w-full py-3 rounded-xl font-bold text-black text-base transition-all disabled:opacity-40"
              style={{ background: '#f59e0b' }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </motion.button>
          </form>

          <button
            onClick={onClose}
            className="w-full mt-3 py-2 text-gray-500 text-sm hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
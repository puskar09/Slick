import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';

export default function AdminHeader() {
  const location = useLocation();
  const isCashier = location.hash === '#/admin/cashier' || location.hash === '' || !location.hash;

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="sticky top-0 z-50 border-b border-white/10"
      style={{ background: '#080808' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-sm font-mono font-bold text-amber-accent tracking-widest">SLICK</span>
          <span className="text-sm font-mono text-text-muted">// ADMIN</span>
        </div>

        <nav className="flex items-center gap-1">
          <Link
            to="/admin/cashier"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              isCashier
                ? 'text-black'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
            style={isCashier ? { background: '#f59e0b' } : {}}
          >
            Cashier
          </Link>
          <Link
            to="/admin/kitchen"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              !isCashier
                ? 'text-black'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
            style={!isCashier ? { background: '#f59e0b' } : {}}
          >
            Kitchen
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}

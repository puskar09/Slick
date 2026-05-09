import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import LoginModal from './LoginModal';

export default function StudentHeader() {
  const cartCount = useCartStore((s) => s.getCount());
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-[24px] border-b border-white/5"
        style={{ background: 'rgba(10,10,10,0.85)' }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="#/student/menu" className="flex items-center gap-2 text-amber-accent">
            <UtensilsCrossed size={22} />
            <span className="text-lg font-bold text-white tracking-tight">Slick</span>
          </a>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <a
                  href="#/student/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="hidden sm:inline text-xs">Profile</span>
                </a>
                <a
                  href="#/student/cart"
                  className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                  </svg>
                  <span className="hidden sm:inline text-xs">Cart</span>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ background: '#f59e0b', color: '#000' }}
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </a>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span className="hidden sm:inline text-xs">Logout</span>
                </button>
              </>
            ) : (
              <>
                <a
                  href="#/student/cart"
                  className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                  </svg>
                  <span className="hidden sm:inline text-xs">Cart</span>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ background: '#f59e0b', color: '#000' }}
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </a>
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-black transition-all hover:brightness-110"
                  style={{ background: '#f59e0b' }}
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMenu } from '../../api/client';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import StudentHeader from '../../components/StudentHeader';
import Toast from '../../components/Toast';
import LoginModal from '../../components/LoginModal';

export default function Menu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [addedItems, setAddedItems] = useState({});
  const [showLogin, setShowLogin] = useState(false);
  const toastTimer = useRef(null);
  const addedTimer = useRef({});

  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    getMenu()
      .then((data) => {
        const menuItems = data.menu || data;
        setItems(menuItems);
        const cats = ['All', ...new Set(menuItems.map(item => item.category))];
        setCategories(cats);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2000);
  }, []);

  const handleAdd = (item) => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    addItem(item);
    showToast(`${item.name} added to cart`);
    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    clearTimeout(addedTimer.current[item.id]);
    addedTimer.current[item.id] = setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  const filtered = activeCategory === 'All' ? items : items.filter((i) => i.category === activeCategory);

  return (
    <div className="min-h-svh flex flex-col bg-[#0a0a0a] font-sans">
      <StudentHeader />

      <div className="max-w-[1200px] mx-auto w-full px-4 md:px-12 py-10 flex-1 pb-24">
        {/* Hero Section */}
        <div className="w-full mb-10 text-center mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-thin text-white leading-tight tracking-tight mb-1"
          >
            What are you<br />
            <span className="italic font-bold text-amber-accent font-serif tracking-normal">craving?</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-text-secondary text-sm mt-2"
          >
            Fresh from the kitchen, made for you.
          </motion.p>
        </div>

        {/* Category Chips */}
        <div className="mb-10 overflow-x-auto scrollbar-none">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex gap-4 pb-2 justify-center flex-wrap"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-6 py-2 rounded-full transition-all text-sm border active:scale-95 ${
                  activeCategory === cat
                    ? 'bg-amber-accent text-black border-amber-accent font-bold'
                    : 'bg-transparent text-white border-white hover:bg-white/10 font-medium'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[24px]">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, idx) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group flex flex-col relative overflow-hidden bg-[#0a0a0a] min-h-[380px] rounded-t-none rounded-b-2xl transition-all duration-300"
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <style>{`
                    article:hover {
                      transform: translateY(-4px);
                      box-shadow: 0 10px 30px -10px rgba(245, 158, 11, 0.3);
                      border-color: rgba(245, 158, 11, 0.2);
                    }
                  `}</style>

                  {/* Image Section */}
                  <div className="relative h-[200px] w-full bg-[#111] overflow-hidden">
                    <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full">
                      {item.category}
                    </div>

                    <img
                      src={item.image_url}
                      alt={item.name}
                      loading="lazy"
                      onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                      className="w-full h-[200px] object-cover transition-transform duration-500 group-hover:scale-105 rounded-t-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-80" />
                  </div>

                  {/* Info Section */}
                  <div className="p-[20px] flex flex-col flex-1">
                    <h3 className="text-white font-bold text-[18px] leading-snug">{item.name}</h3>

                    <div className="flex items-center gap-2 mt-[8px]">
                      <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,225,118,0.8)] animate-pulse"></span>
                      <span className="text-amber-accent font-bold text-[16px]">₹{item.price}</span>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAdd(item)}
                    className={`w-full h-[44px] text-black font-bold text-[15px] transition-colors rounded-t-none rounded-b-2xl flex items-center justify-center ${
                      addedItems[item.id]
                        ? 'bg-green-500 hover:bg-green-500'
                        : 'bg-amber-accent hover:bg-amber-hover'
                    }`}
                  >
                    {addedItems[item.id] ? '✓ Added!' : '+ Add to Cart'}
                  </button>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {toastMsg && <Toast message={toastMsg} />}
      </AnimatePresence>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
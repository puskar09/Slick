import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

export default function Header() {
  const cartCount = useCartStore((s) => s.getCount());

  return (
    <header className="sticky top-0 z-50 bg-bg-base/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/student/menu" className="flex items-center gap-2 text-amber-accent font-mono tracking-[0.2em] uppercase font-bold text-xl">
          SLICK
        </Link>

        <nav className="flex items-center">
          <Link
            to="/student/cart"
            className="relative flex items-center justify-center p-2 rounded-full hover:bg-white/5 transition-colors text-amber-accent"
          >
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-accent text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import PageTransition from './components/PageTransition';
import Landing from './pages/Landing';
import Menu from './pages/student/Menu';
import OrderSummary from './pages/student/OrderSummary';
import OrderStatus from './pages/student/OrderStatus';
import Profile from './pages/student/Profile';
import CashierPanel from './pages/admin/CashierPanel';
import KitchenPanel from './pages/admin/KitchenPanel';

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-svh flex flex-col bg-[#0a0a0a]">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/student/menu" element={<PageTransition><Menu /></PageTransition>} />
          <Route path="/student/cart" element={<PageTransition><OrderSummary /></PageTransition>} />
          <Route path="/student/status" element={<PageTransition><OrderStatus /></PageTransition>} />
          <Route path="/student/profile" element={<PageTransition><Profile /></PageTransition>} />
          <Route path="/admin/cashier" element={<CashierPanel />} />
          <Route path="/admin/kitchen" element={<KitchenPanel />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
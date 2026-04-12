import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import Dashboard from './pages/Dashboard';
import Community from './pages/Community';
import StrategyGenerator from './pages/StrategyGenerator';
import WalletPage from './pages/Wallet';
import InvitePage from './pages/Invite';
import AdminRecharges from './pages/AdminRecharges';

gsap.registerPlugin(ScrollTrigger);

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<'community' | 'dashboard' | 'strategy' | 'wallet' | 'invite' | 'admin-recharges'>(() => {
    const hash = window.location.hash;
    if (hash === '#dashboard') return 'dashboard';
    if (hash === '#strategy') return 'strategy';
    if (hash === '#wallet') return 'wallet';
    if (hash === '#invite') return 'invite';
    if (hash === '#admin/recharges') return 'admin-recharges';
    return 'community';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#dashboard') setCurrentPage('dashboard');
      else if (hash === '#strategy') setCurrentPage('strategy');
      else if (hash === '#wallet') setCurrentPage('wallet');
      else if (hash === '#invite') setCurrentPage('invite');
      else if (hash === '#admin/recharges') setCurrentPage('admin-recharges');
      else setCurrentPage('community');
    };

    window.addEventListener('hashchange', handleHashChange);

    ScrollTrigger.defaults({
      toggleActions: 'play none none none',
    });
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // 简单的页面切换，不使用 react-router
  if (currentPage === 'dashboard') {
    return isAuthenticated ? <Dashboard /> : <Community />;
  }

  if (currentPage === 'strategy') {
    return <StrategyGenerator />;
  }

  if (currentPage === 'wallet') {
    return isAuthenticated ? <WalletPage /> : <Community />;
  }

  if (currentPage === 'invite') {
    return isAuthenticated ? <InvitePage /> : <Community />;
  }

  if (currentPage === 'admin-recharges') {
    return isAuthenticated ? <AdminRecharges /> : <Community />;
  }

  return <Community />;
}

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <AppContent />
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;

import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import Dashboard from './pages/Dashboard';
import Community from './pages/Community';

gsap.registerPlugin(ScrollTrigger);

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<'community' | 'dashboard'>(() => {
    return window.location.hash === '#dashboard' ? 'dashboard' : 'community';
  });

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(window.location.hash === '#dashboard' ? 'dashboard' : 'community');
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

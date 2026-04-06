import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import MarketTicker from './components/MarketTicker';
import Stats from './sections/Stats';
import About from './sections/About';
import Traders from './sections/Traders';
import HowItWorks from './sections/HowItWorks';
import Features from './sections/Features';
import Testimonials from './sections/Testimonials';
import Pricing from './sections/Pricing';
import FAQ from './sections/FAQ';
import Blog from './sections/Blog';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import Dashboard from './pages/Dashboard';

gsap.registerPlugin(ScrollTrigger);

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard'>(() => {
    return window.location.hash === '#dashboard' ? 'dashboard' : 'home';
  });

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(window.location.hash === '#dashboard' ? 'dashboard' : 'home');
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
    return isAuthenticated ? <Dashboard /> : <HomePage />;
  }

  return <HomePage />;
}

function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <MarketTicker />
      <main>
        <Hero />
        <Stats />
        <About />
        <Traders />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <Blog />
        <Contact />
      </main>
      <Footer />
    </div>
  );
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

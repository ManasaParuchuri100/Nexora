import React, { useState } from 'react';
import BackgroundAtmosphere from './components/BackgroundAtmosphere';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import EditorialPhilosophy from './components/EditorialPhilosophy';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import NexoraApp from './components/NexoraApp';
import InfoModal from './components/InfoModal';

export default function App() {
  const [inApp, setInApp] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [modalType, setModalType] = useState<'contact' | 'privacy' | 'terms' | null>(null);

  const handleOpenApp = (mode: 'login' | 'signup' = 'signup') => {
    setAuthMode(mode);
    setInApp(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnToLanding = () => {
    setInApp(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLearnMore = () => {
    const featuresEl = document.getElementById('features');
    if (featuresEl) {
      featuresEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (inApp) {
    return (
      <NexoraApp 
        initialMode={authMode} 
        onReturnToLanding={handleReturnToLanding} 
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#071C1A] text-[#E8E9D8] font-sans-body overflow-x-hidden selection:bg-[#A9BFA5]/25 selection:text-[#E8E9D8]">
      {/* Abstract visual atmosphere with dark teal gradients, subtle glows, and delicate curved vector lines */}
      <BackgroundAtmosphere />

      {/* Main Landing Page Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onOpenApp={handleOpenApp} />
        
        <main className="flex-1">
          <Hero 
            onGetStarted={() => handleOpenApp('signup')}
            onLearnMore={handleLearnMore}
          />
          
          <Features onOpenApp={() => handleOpenApp('signup')} />
          
          <HowItWorks onOpenApp={() => handleOpenApp('signup')} />
          
          <EditorialPhilosophy />
          
          <FinalCTA onGetStarted={() => handleOpenApp('signup')} />
        </main>

        <Footer 
          onOpenApp={() => handleOpenApp('signup')}
          onContactClick={() => setModalType('contact')}
          onPrivacyClick={() => setModalType('privacy')}
          onTermsClick={() => setModalType('terms')}
        />
      </div>

      {/* Optional Information Modal for Contact / Privacy / Terms */}
      <InfoModal 
        type={modalType} 
        onClose={() => setModalType(null)} 
      />
    </div>
  );
}

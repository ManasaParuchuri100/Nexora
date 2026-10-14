import React, { useState, useEffect } from 'react';
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
import AuthModal, { UserSession } from './components/AuthModal';
import OnboardingFlow, { OnboardingData } from './components/OnboardingFlow';

export default function App() {
  const [inApp, setInApp] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>({
    name: 'Acme Studio',
    email: 'you@acme.com',
    workspace: 'Acme Studio',
    role: 'Owner'
  });
  const [modalType, setModalType] = useState<'contact' | 'privacy' | 'terms' | null>(null);

  // Check URL on load for #login, #signup, #onboarding, or query params
  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    const pathname = window.location.pathname;

    if (hash === '#login' || search.includes('auth=login') || pathname === '/login') {
      setInApp(false);
      setAuthMode('login');
      setIsAuthOpen(true);
      setIsOnboardingOpen(false);
    } else if (
      hash === '#signup' || 
      search.includes('auth=signup') || 
      pathname === '/signup' || 
      hash === '#onboarding' || 
      pathname === '/onboarding'
    ) {
      setInApp(false);
      setIsAuthOpen(false);
      setIsOnboardingOpen(true);
    }
  }, []);

  // When clicking "Log in"
  const handleOpenLogin = () => {
    setIsOnboardingOpen(false);
    setAuthMode('login');
    setIsAuthOpen(true);
  };

  // When clicking "Get started"
  const handleOpenGetStarted = () => {
    setIsAuthOpen(false);
    setIsOnboardingOpen(true);
  };

  // Direct 1-click launch into workspace
  const handleDirectLaunch = () => {
    setInApp(true);
    setIsAuthOpen(false);
    setIsOnboardingOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Called when login succeeds from AuthModal
  const handleAuthSuccess = (user: UserSession) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    setIsOnboardingOpen(false);
    setInApp(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Called when onboarding finishes (Images 1-5 flow)
  const handleOnboardingComplete = (data: OnboardingData) => {
    setCurrentUser({
      name: data.name,
      email: data.email,
      workspace: data.businessName,
      role: 'Owner'
    });
    // Set First-Run Mode active so Image 6 empty states appear
    setIsFirstRun(true);
    setIsOnboardingOpen(false);
    setIsAuthOpen(false);
    setInApp(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return to landing page on logout
  const handleReturnToLanding = () => {
    setInApp(false);
    setIsAuthOpen(false);
    setIsOnboardingOpen(false);
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
      <>
        <NexoraApp 
          initialMode={authMode} 
          onReturnToLanding={handleReturnToLanding}
          currentUser={currentUser}
          onOpenLogin={handleOpenLogin}
          initialFirstRun={isFirstRun}
        />

        {/* Global Auth Modal accessible from inside app if user wants to switch account */}
        <AuthModal
          isOpen={isAuthOpen}
          initialMode={authMode}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={handleAuthSuccess}
          onSwitchToSignup={handleOpenGetStarted}
        />

        {/* Onboarding flow accessible from inside if requested */}
        <OnboardingFlow
          isOpen={isOnboardingOpen}
          initialStep="signup"
          onClose={() => setIsOnboardingOpen(false)}
          onOpenLogin={handleOpenLogin}
          onComplete={handleOnboardingComplete}
        />
      </>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#071C1A] text-[#E8E9D8] font-sans-body overflow-x-hidden selection:bg-[#A9BFA5]/25 selection:text-[#E8E9D8]">
      {/* Abstract visual atmosphere with dark teal gradients, subtle glows, and delicate curved vector lines */}
      <BackgroundAtmosphere />

      {/* Top Banner for Instant Workspace Switch */}
      <div className="relative z-30 bg-[#061816] border-b border-[rgba(169,191,165,0.2)] py-1.5 px-4 text-center font-mono text-[11px] text-[#A9BFA5] flex items-center justify-center space-x-3">
        <span className="hidden sm:inline">✦ Tecavy Lead Intelligence & Autonomous Inbox</span>
        <button
          type="button"
          onClick={handleOpenLogin}
          className="text-white hover:text-emerald-300 font-semibold underline cursor-pointer"
        >
          [Log In to Workspace]
        </button>
        <span className="opacity-40">·</span>
        <button
          type="button"
          onClick={handleOpenGetStarted}
          className="text-amber-300 hover:text-white font-semibold underline cursor-pointer"
        >
          [Get Started · 3-Step Setup]
        </button>
        <span className="opacity-40">·</span>
        <button
          type="button"
          onClick={handleDirectLaunch}
          className="text-emerald-300 hover:text-white font-semibold cursor-pointer"
        >
          ⚡ Direct 1-Click Launch →
        </button>
      </div>

      {/* Main Landing Page Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar 
          onOpenApp={(mode) => mode === 'signup' ? handleOpenGetStarted() : handleOpenLogin()} 
        />
        
        <main className="flex-1">
          <Hero 
            onGetStarted={handleOpenGetStarted}
            onLearnMore={handleLearnMore}
          />
          
          <Features onOpenApp={handleOpenGetStarted} />
          
          <HowItWorks onOpenApp={handleOpenGetStarted} />
          
          <EditorialPhilosophy />
          
          <FinalCTA onGetStarted={handleOpenGetStarted} />
        </main>

        <Footer 
          onOpenApp={handleOpenGetStarted}
          onContactClick={() => setModalType('contact')}
          onPrivacyClick={() => setModalType('privacy')}
          onTermsClick={() => setModalType('terms')}
        />
      </div>

      {/* Onboarding Flow (Image 1 Signup + Images 2-4 3-Step Onboarding) */}
      <OnboardingFlow
        isOpen={isOnboardingOpen}
        initialStep="signup"
        onClose={() => setIsOnboardingOpen(false)}
        onOpenLogin={handleOpenLogin}
        onComplete={handleOnboardingComplete}
      />

      {/* Login Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        onSwitchToSignup={handleOpenGetStarted}
      />

      {/* Optional Information Modal for Contact / Privacy / Terms */}
      <InfoModal 
        type={modalType} 
        onClose={() => setModalType(null)} 
      />
    </div>
  );
}

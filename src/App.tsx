import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BirthdaysSection } from './components/BirthdaysSection';
import { WorkshopsSection } from './components/WorkshopsSection';
import { DaycareSection } from './components/DaycareSection';
import { FaqSection } from './components/FaqSection';
import { BookingCalendar } from './components/BookingCalendar';
import { ContactFooter } from './components/ContactFooter';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { LiabilityWaiverFormModal } from './components/LiabilityWaiverFormModal';
import { FloatingChatbot } from './components/FloatingChatbot';
import { isAdminAuthenticated, syncWithRemoteFirestore } from './services/storage';

export default function App() {
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Liability Waiver Direct URL Link State
  const [activeWaiverReservationId, setActiveWaiverReservationId] = useState<string | null>(null);
  const [isWaiverModalOpen, setIsWaiverModalOpen] = useState(false);

  useEffect(() => {
    setIsAdminLoggedIn(isAdminAuthenticated());
    
    // Sync with Firebase in the background
    syncWithRemoteFirestore().catch(e => console.warn('Background sync failed:', e));

    const checkForWaiverParam = () => {
      try {
        const fullHref = window.location.href;
        
        // 1. Check standard URLSearchParams (?waiver=...)
        const urlParams = new URLSearchParams(window.location.search);
        const fromSearch = urlParams.get('waiver') || urlParams.get('deslinde');
        if (fromSearch) {
          setActiveWaiverReservationId(fromSearch);
          setIsWaiverModalOpen(true);
          return;
        }

        // 2. Check hash string (#waiver=... or #?waiver=...)
        if (window.location.hash) {
          const hash = window.location.hash;
          const hashIdx = hash.indexOf('?');
          if (hashIdx !== -1) {
            const hashParams = new URLSearchParams(hash.substring(hashIdx));
            const fromHash = hashParams.get('waiver') || hashParams.get('deslinde');
            if (fromHash) {
              setActiveWaiverReservationId(fromHash);
              setIsWaiverModalOpen(true);
              return;
            }
          }
          if (hash.includes('waiver=')) {
            const parts = hash.split('waiver=');
            if (parts[1]) {
              const cleanId = parts[1].split('&')[0];
              setActiveWaiverReservationId(decodeURIComponent(cleanId));
              setIsWaiverModalOpen(true);
              return;
            }
          }
        }

        // 3. Fallback regex on full URL
        const match = fullHref.match(/[?&#](?:waiver|deslinde)=([^&#]+)/i);
        if (match && match[1]) {
          setActiveWaiverReservationId(decodeURIComponent(match[1]));
          setIsWaiverModalOpen(true);
        }
      } catch (e) {
        console.warn('Waiver URL check error:', e);
      }
    };

    checkForWaiverParam();

    window.addEventListener('popstate', checkForWaiverParam);
    window.addEventListener('hashchange', checkForWaiverParam);

    return () => {
      window.removeEventListener('popstate', checkForWaiverParam);
      window.removeEventListener('hashchange', checkForWaiverParam);
    };
  }, []);

  const handleOpenBooking = () => {
    const calendarElement = document.getElementById('reservar');
    if (calendarElement) {
      calendarElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAdminTrigger = () => {
    if (isAdminAuthenticated()) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminDashboardOpen(true);
  };

  const handleOpenGeneralWaiver = () => {
    setActiveWaiverReservationId(null);
    setIsWaiverModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#ED3078] selection:text-white antialiased relative">
      
      {/* Main Header */}
      <Header
        onOpenBooking={handleOpenBooking}
        onOpenAdmin={handleOpenAdminTrigger}
        onOpenWaiver={handleOpenGeneralWaiver}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Content Sections */}
      <main>
        <Hero
          onOpenBooking={handleOpenBooking}
        />

        <BirthdaysSection
          onOpenBooking={handleOpenBooking}
        />

        <WorkshopsSection />

        <DaycareSection />

        <FaqSection />

        <BookingCalendar
          onReservationCreated={() => {
            // Callback when a booking is created
          }}
        />
      </main>

      {/* Footer */}
      <ContactFooter
        onOpenBooking={handleOpenBooking}
        onOpenAdmin={handleOpenAdminTrigger}
        onOpenWaiver={handleOpenGeneralWaiver}
      />

      <FloatingChatbot />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Full Screen Admin Dashboard */}
      {isAdminDashboardOpen && (
        <AdminDashboard
          onCloseAdmin={() => {
            setIsAdminDashboardOpen(false);
            setIsAdminLoggedIn(isAdminAuthenticated());
          }}
        />
      )}

      {/* Client-Facing Liability Waiver Form Modal (Accessible via WhatsApp Link) */}
      <LiabilityWaiverFormModal
        isOpen={isWaiverModalOpen}
        reservationId={activeWaiverReservationId}
        onClose={() => {
          setIsWaiverModalOpen(false);
          setActiveWaiverReservationId(null);
          // Clean URL parameter without reloading page
          if (window.history.replaceState) {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }}
      />

    </div>
  );
}

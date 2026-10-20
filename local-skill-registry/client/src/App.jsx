import React, { useState, useEffect } from 'react';
import { I18nProvider } from './i18n';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchPage } from './pages/SearchPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ContactModal } from './components/ContactModal';
import { TrackRequestModal } from './components/TrackRequestModal';
import { RatingModal } from './components/RatingModal';
import { isAuthenticated } from './services/authService';

export const AppContent = () => {
  const [activePage, setActivePage] = useState('search');

  // Modal states
  const [selectedWorkerForContact, setSelectedWorkerForContact] = useState(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackInitialId, setTrackInitialId] = useState('');
  const [ratingTargetRequest, setRatingTargetRequest] = useState(null);

  // If user tries to open admin dashboard without auth, redirect to login
  const handleNavPage = (page) => {
    if (page === 'admin-dashboard' && !isAuthenticated()) {
      setActivePage('admin-login');
      return;
    }
    setActivePage(page);
  };

  // Open track request modal with optional pre-filled ID
  const handleOpenTrackModal = (initialId = '') => {
    setTrackInitialId(initialId);
    setIsTrackModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* Navbar with language switcher and page navigation */}
      <Navbar
        activePage={activePage}
        setActivePage={handleNavPage}
        onOpenTrackModal={() => handleOpenTrackModal('')}
      />

      {/* Pages */}
      <main style={{ flex: 1 }}>
        {activePage === 'search' && (
          <SearchPage
            onRequestContact={(worker) => setSelectedWorkerForContact(worker)}
          />
        )}

        {activePage === 'register' && (
          <RegisterPage onGoToDirectory={() => setActivePage('search')} />
        )}

        {activePage === 'admin-login' && (
          <AdminLoginPage
            onLoginSuccess={() => setActivePage('admin-dashboard')}
          />
        )}

        {activePage === 'admin-dashboard' && <AdminDashboard />}
      </main>

      {/* Contact Request Modal (Guarded Privacy Flow) */}
      {selectedWorkerForContact && (
        <ContactModal
          worker={selectedWorkerForContact}
          onClose={() => setSelectedWorkerForContact(null)}
          onTrackImmediately={(trackingId) => handleOpenTrackModal(trackingId)}
        />
      )}

      {/* Track Contact Request Modal (Unlock Phone after Approval) */}
      {isTrackModalOpen && (
        <TrackRequestModal
          initialTrackingId={trackInitialId}
          onClose={() => {
            setIsTrackModalOpen(false);
            setTrackInitialId('');
          }}
          onOpenRatingModal={(req) => {
            setIsTrackModalOpen(false);
            setRatingTargetRequest(req);
          }}
        />
      )}

      {/* 1-5 Star Rating Modal */}
      {ratingTargetRequest && (
        <RatingModal
          request={ratingTargetRequest}
          onClose={() => setRatingTargetRequest(null)}
          onRatingSubmitted={() => {
            // Can reload or toast
          }}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </I18nProvider>
  );
}

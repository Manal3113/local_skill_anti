import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  Languages,
  Download,
  LogOut,
  Menu,
  X,
  FileSearch,
} from 'lucide-react';
import { isAuthenticated, getStoredAdminUser, logoutAdmin } from '../services/authService';

export const Navbar = ({ activePage, setActivePage, onOpenTrackModal }) => {
  const { lang, setLanguage, t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const adminUser = getStoredAdminUser();
  const loggedIn = isAuthenticated();

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  };

  const handleNavClick = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logoutAdmin();
    setActivePage('search');
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main Navigation">
      <div className="nav-inner">
        {/* Brand */}
        <div className="brand-wrap" onClick={() => handleNavClick('search')}>
          <div className="brand-icon">
            <Users size={24} />
          </div>
          <div className="brand-text">
            <h1>
              <span>{t('app.title')}</span>
            </h1>
            <p>{t('app.panchayatAffiliation')}</p>
          </div>
        </div>

        {/* Desktop Nav & Actions */}
        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <button
            className={`nav-btn ${activePage === 'search' ? 'active' : ''}`}
            onClick={() => handleNavClick('search')}
          >
            <Search size={16} />
            <span>{t('nav.findWorkers')}</span>
          </button>

          <button
            className={`nav-btn ${activePage === 'register' ? 'active' : ''}`}
            onClick={() => handleNavClick('register')}
          >
            <UserPlus size={16} />
            <span>{t('nav.registerWorker')}</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => {
              onOpenTrackModal();
              setMobileMenuOpen(false);
            }}
          >
            <FileSearch size={16} />
            <span>{t('nav.trackRequest')}</span>
          </button>

          {/* Admin link */}
          {loggedIn ? (
            <>
              <button
                className={`nav-btn ${activePage === 'admin-dashboard' ? 'active' : ''}`}
                onClick={() => handleNavClick('admin-dashboard')}
              >
                <ShieldCheck size={16} />
                <span>{t('nav.dashboard')}</span>
              </button>

              <button className="nav-btn btn-danger btn-sm" onClick={handleLogout} title="Logout">
                <LogOut size={15} />
                <span>{t('nav.logout')}</span>
              </button>
            </>
          ) : (
            <button
              className={`nav-btn ${activePage === 'admin-login' ? 'active' : ''}`}
              onClick={() => handleNavClick('admin-login')}
            >
              <ShieldCheck size={16} />
              <span>{t('nav.admin')}</span>
            </button>
          )}

          {/* PWA Install Button */}
          {canInstall && (
            <button
              className="nav-btn btn-sm btn-accent"
              onClick={handleInstallClick}
              title="Install app to your home screen"
            >
              <Download size={15} />
              <span>{t('nav.installApp')}</span>
            </button>
          )}

          {/* Multilingual Selector */}
          <div className="lang-dropdown" title="Change display language">
            <Languages size={15} style={{ color: 'var(--text-muted)' }} />
            <select
              className="lang-select"
              value={lang}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="Language selection"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="nav-btn"
          style={{ display: 'none', padding: 8 }}
          id="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <style>{`
        @media (max-width: 860px) {
          #mobile-menu-toggle {
            display: inline-flex !important;
          }
        }
      `}</style>
    </nav>
  );
};

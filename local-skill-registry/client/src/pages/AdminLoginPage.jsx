import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { useToast } from '../components/Toast';
import { loginAdmin } from '../services/authService';
import { ShieldCheck, Lock, User, KeyRound, LogIn, Sparkles } from 'lucide-react';

export const AdminLoginPage = ({ onLoginSuccess }) => {
  const { t } = useI18n();
  const { addToast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('Panchayat@2026');
    addToast('Demo credentials filled!', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      addToast('Please enter both username and password', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await loginAdmin(username.trim(), password);
      addToast(`Welcome, ${response.user.fullName}!`, 'success');
      onLoginSuccess();
    } catch (err) {
      addToast(err.message || 'Login failed. Please verify credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: 460, margin: '40px auto' }}>
      <div className="filter-card" style={{ padding: 32, boxShadow: 'var(--shadow-lg)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, #166534 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 4px 12px rgba(20, 83, 45, 0.25)',
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>
            {t('admin.loginTitle')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            {t('admin.loginSubtitle')}
          </p>
        </div>

        {/* Demo Credentials Quick Fill Banner */}
        <div
          style={{
            background: '#fefce8',
            border: '1px solid #fef08a',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: 20,
            fontSize: '0.82rem',
            color: '#854d0e',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              <strong>Demo Login:</strong> admin / Panchayat@2026
            </span>
            <button
              type="button"
              className="btn btn-sm"
              style={{
                background: '#fef08a',
                border: 'none',
                color: '#713f12',
                padding: '3px 8px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
              onClick={handleFillDemo}
            >
              <Sparkles size={12} />
              <span>Fill</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">{t('admin.username')}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter clerk username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">{t('admin.password')}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            <LogIn size={16} />
            <span>{loading ? t('admin.loggingIn') : t('admin.loginBtn')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { useToast } from './Toast';
import { submitContactRequest } from '../services/contactService';
import { X, ShieldAlert, CheckCircle2, Copy, FileSearch, Send, Lock } from 'lucide-react';

export const ContactModal = ({ worker, onClose, onTrackImmediately }) => {
  const { t } = useI18n();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    requesterName: '',
    requesterOrganization: '',
    requesterPhone: '',
    requesterEmail: '',
    purpose: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  if (!worker) return null;

  const validate = () => {
    const errors = {};
    if (!formData.requesterName.trim() || formData.requesterName.trim().length < 2) {
      errors.requesterName = 'Name must be at least 2 characters';
    }
    if (!formData.requesterOrganization.trim()) {
      errors.requesterOrganization = 'Please specify your organization or designation';
    }
    const cleanPhone = formData.requesterPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      errors.requesterPhone = 'Please provide a valid 10-digit mobile number';
    }
    if (!formData.purpose.trim() || formData.purpose.trim().length < 5) {
      errors.purpose = 'Please describe the work requirement (min 5 characters)';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        workerId: worker._id,
        ...formData,
      };
      const response = await submitContactRequest(payload);
      setSuccessResult(response);
      addToast(t('contactSuccess.title'), 'success');
    } catch (err) {
      addToast(err.message || 'Failed to submit contact request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Reference ID copied to clipboard!', 'info');
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3>{t('contactModal.title')}</h3>
            <p>
              {t('contactModal.subtitle', {
                name: worker.name,
                skill: worker.skillCategory,
                village: worker.village,
              })}
            </p>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Success Screen */}
        {successResult ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: '28px 24px' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#15803d',
                margin: '0 auto 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h4 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: 6 }}>
              {t('contactSuccess.title')}
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
              {t('contactSuccess.message')}
            </p>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: 20,
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {t('contactSuccess.trackingIdLabel')}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => copyToClipboard(successResult.trackingId)}
                  title="Copy Tracking ID"
                >
                  <Copy size={13} />
                  <span>Copy</span>
                </button>
              </div>
              <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.02em' }}>
                {successResult.trackingId}
              </p>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
              {t('contactSuccess.copyNotice')}
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  if (onTrackImmediately) {
                    onTrackImmediately(successResult.trackingId);
                  }
                }}
              >
                <FileSearch size={15} />
                <span>Track This Request Now</span>
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                {t('contactSuccess.close')}
              </button>
            </div>
          </div>
        ) : (
          /* Request Form */
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Privacy Safeguard Explanation */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  display: 'flex',
                  gap: 12,
                  fontSize: '0.83rem',
                  color: '#166534',
                  lineHeight: 1.45,
                }}
              >
                <Lock size={18} style={{ flexShrink: 0, marginTop: 2, color: '#15803d' }} />
                <span>{t('contactModal.privacyBanner')}</span>
              </div>

              {/* Requester Name */}
              <div className="form-group">
                <label className="form-label">{t('contactModal.requesterName')}</label>
                <input
                  type="text"
                  className={`form-input ${formErrors.requesterName ? 'input-error' : ''}`}
                  placeholder={t('contactModal.requesterNamePlaceholder')}
                  value={formData.requesterName}
                  onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                />
                {formErrors.requesterName && <span className="form-error">{formErrors.requesterName}</span>}
              </div>

              {/* Requester Organization / Role */}
              <div className="form-group">
                <label className="form-label">{t('contactModal.organization')}</label>
                <input
                  type="text"
                  className={`form-input ${formErrors.requesterOrganization ? 'input-error' : ''}`}
                  placeholder={t('contactModal.orgPlaceholder')}
                  value={formData.requesterOrganization}
                  onChange={(e) => setFormData({ ...formData, requesterOrganization: e.target.value })}
                />
                {formErrors.requesterOrganization && (
                  <span className="form-error">{formErrors.requesterOrganization}</span>
                )}
              </div>

              {/* Requester Mobile */}
              <div className="form-group">
                <label className="form-label">{t('contactModal.phone')}</label>
                <input
                  type="tel"
                  className={`form-input ${formErrors.requesterPhone ? 'input-error' : ''}`}
                  placeholder={t('contactModal.phonePlaceholder')}
                  value={formData.requesterPhone}
                  onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
                  maxLength={13}
                />
                {formErrors.requesterPhone && <span className="form-error">{formErrors.requesterPhone}</span>}
              </div>

              {/* Requester Email */}
              <div className="form-group">
                <label className="form-label">{t('contactModal.email')}</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder={t('contactModal.emailPlaceholder')}
                  value={formData.requesterEmail}
                  onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                />
              </div>

              {/* Purpose */}
              <div className="form-group">
                <label className="form-label">{t('contactModal.purpose')}</label>
                <textarea
                  className={`form-textarea ${formErrors.purpose ? 'input-error' : ''}`}
                  placeholder={t('contactModal.purposePlaceholder')}
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  rows={3}
                />
                {formErrors.purpose && <span className="form-error">{formErrors.purpose}</span>}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                {t('contactModal.cancel')}
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                <Send size={15} />
                <span>{isSubmitting ? t('contactModal.submitting') : t('contactModal.submit')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

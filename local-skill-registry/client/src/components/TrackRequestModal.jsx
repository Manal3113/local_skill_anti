import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import { useToast } from './Toast';
import { trackContactRequest } from '../services/contactService';
import {
  X,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  MessageSquare,
  Star,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const TrackRequestModal = ({ initialTrackingId = '', onClose, onOpenRatingModal }) => {
  const { t } = useI18n();
  const { addToast } = useToast();

  const [searchIdentifier, setSearchIdentifier] = useState(initialTrackingId);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialTrackingId) {
      handleTrack(initialTrackingId);
    }
  }, [initialTrackingId]);

  const handleTrack = async (idToSearch) => {
    const id = idToSearch || searchIdentifier;
    if (!id || id.trim() === '') {
      addToast('Please enter your Request ID or mobile number', 'error');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const response = await trackContactRequest(id.trim());
      setResults(response.requests || []);
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3>{t('trackModal.title')}</h3>
            <p>{t('trackModal.subtitle')}</p>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Tracking Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrack();
            }}
            style={{ display: 'flex', gap: 10 }}
          >
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder={t('trackModal.inputPlaceholder')}
                value={searchIdentifier}
                onChange={(e) => setSearchIdentifier(e.target.value)}
                style={{ paddingLeft: 14 }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Search size={16} />
              <span>{loading ? t('trackModal.tracking') : t('trackModal.trackButton')}</span>
            </button>
          </form>

          {/* Quick Demo Fill Buttons for Testing */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Demo sample IDs:</span>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => {
                setSearchIdentifier('LSR-2026-1001');
                handleTrack('LSR-2026-1001');
              }}
            >
              LSR-2026-1001 (Approved)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => {
                setSearchIdentifier('LSR-2026-1003');
                handleTrack('LSR-2026-1003');
              }}
            >
              LSR-2026-1003 (Pending)
            </button>
          </div>

          {/* Results Display */}
          {searched && (
            <div style={{ marginTop: 16 }}>
              {loading ? (
                <div style={{ padding: 24, textAlign: 'center' }}>
                  <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-md)' }}></div>
                </div>
              ) : results && results.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {results.map((req) => (
                    <div
                      key={req._id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: 16,
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      {/* Top Info */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {req.trackingId}
                          </span>
                          <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginTop: 2 }}>
                            {req.workerName}{' '}
                            <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>
                              ({req.workerSkill} • {req.workerVillage})
                            </span>
                          </h4>
                        </div>

                        {/* Status Badge */}
                        {req.status === 'approved' && (
                          <span className="badge badge-verified">
                            <CheckCircle size={14} />
                            {t('trackModal.statusApproved')}
                          </span>
                        )}
                        {req.status === 'pending' && (
                          <span className="badge badge-busy">
                            <Clock size={14} />
                            {t('trackModal.statusPending')}
                          </span>
                        )}
                        {req.status === 'denied' && (
                          <span className="badge" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                            <XCircle size={14} />
                            {t('trackModal.statusDenied')}
                          </span>
                        )}
                      </div>

                      {/* Purpose */}
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                        <strong>Requirement:</strong> {req.purpose}
                      </p>

                      {/* Status Specific Section */}
                      {req.status === 'pending' && (
                        <div
                          style={{
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            borderRadius: 'var(--radius-sm)',
                            padding: '10px 14px',
                            fontSize: '0.85rem',
                            color: '#92400e',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <Clock size={16} style={{ flexShrink: 0 }} />
                          <span>{t('trackModal.pendingMsg')}</span>
                        </div>
                      )}

                      {req.status === 'denied' && (
                        <div
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: 'var(--radius-sm)',
                            padding: '10px 14px',
                            fontSize: '0.85rem',
                            color: '#991b1b',
                          }}
                        >
                          <p>
                            <strong>{t('trackModal.deniedMsg')}</strong> {req.adminNotes || 'Request did not meet privacy guidelines.'}
                          </p>
                        </div>
                      )}

                      {req.status === 'approved' && (
                        <div
                          style={{
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: 'var(--radius-md)',
                            padding: '14px',
                            marginTop: 10,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534', fontWeight: 600, fontSize: '0.9rem', marginBottom: 6 }}>
                            <ShieldCheck size={18} />
                            <span>{t('trackModal.approvedMsg')}</span>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: 12,
                              background: '#ffffff',
                              border: '1px solid #86efac',
                              borderRadius: 'var(--radius-sm)',
                              padding: '10px 14px',
                              margin: '8px 0',
                            }}
                          >
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              {t('trackModal.phoneUnlocked')}
                            </span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d', letterSpacing: '0.04em' }}>
                              +91 {req.revealedPhone || '98221 04590'}
                            </span>
                          </div>

                          {/* Call & WhatsApp Actions */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                            <a
                              href={`tel:+91${req.revealedPhone || '9822104590'}`}
                              className="btn btn-primary btn-sm"
                              style={{ textDecoration: 'none' }}
                            >
                              <Phone size={14} />
                              <span>{t('trackModal.callNow')}</span>
                            </a>
                            <a
                              href={`https://wa.me/91${(req.revealedPhone || '9822104590').replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(req.workerName)},%20I%20found%20your%20profile%20on%20the%20Local%20Skill%20Registry.`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-success btn-sm"
                              style={{ textDecoration: 'none' }}
                            >
                              <MessageSquare size={14} />
                              <span>{t('trackModal.whatsapp')}</span>
                            </a>

                            {/* Rate Worker Button */}
                            {!req.hasRated ? (
                              <button
                                type="button"
                                className="btn btn-accent btn-sm"
                                onClick={() => {
                                  onClose();
                                  if (onOpenRatingModal) {
                                    onOpenRatingModal(req);
                                  }
                                }}
                              >
                                <Star size={14} />
                                <span>{t('trackModal.rateWorker')}</span>
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: '#166534', alignSelf: 'center', fontWeight: 600 }}>
                                ✓ {t('trackModal.alreadyRated')}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <AlertCircle size={36} style={{ color: 'var(--text-light)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>{t('trackModal.noRecord')}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('contactSuccess.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

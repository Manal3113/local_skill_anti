import React from 'react';
import { useI18n } from '../i18n';
import {
  MapPin,
  Star,
  CheckCircle,
  Clock,
  Briefcase,
  Lock,
  Phone,
  IndianRupee,
  CreditCard,
  ShieldCheck,
  Award,
} from 'lucide-react';

export const WorkerCard = ({ worker, onRequestContact }) => {
  const { t } = useI18n();

  // Initials for avatar
  const initials = worker.name
    ? worker.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'W';

  const renderAvailabilityBadge = (status) => {
    switch (status) {
      case 'available':
        return (
          <span className="badge badge-available">
            <span className="pulse-dot"></span>
            {t('workerCard.available')}
          </span>
        );
      case 'busy':
        return (
          <span className="badge badge-busy">
            <Clock size={12} />
            {t('workerCard.busy')}
          </span>
        );
      case 'seasonal':
        return (
          <span className="badge badge-seasonal">
            <Clock size={12} />
            {t('workerCard.seasonal')}
          </span>
        );
      case 'on_leave':
        return (
          <span className="badge badge-onleave">
            <Clock size={12} />
            {t('workerCard.onLeave')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <article className="worker-card" aria-label={`Worker ${worker.name}`}>
      <div>
        {/* Top Header */}
        <div className="worker-header">
          <div className="worker-avatar-wrap">
            <div className="worker-avatar">{initials}</div>
            <div className="worker-names">
              <h3>{worker.name}</h3>
              <span className="worker-skill-badge">{worker.skillCategory}</span>
            </div>
          </div>
        </div>

        {/* Location & Panchayat Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 8 }}>
          <MapPin size={15} style={{ color: 'var(--accent)' }} />
          <span>{worker.village}</span>
        </div>

        <div className="worker-badges-row">
          {/* Verification Badge */}
          {worker.isVerified ? (
            <span className="badge badge-verified" title={worker.verifiedBy ? `Verified by ${worker.verifiedBy}` : 'Verified by Gram Panchayat'}>
              <ShieldCheck size={14} style={{ color: '#16a34a' }} />
              {t('workerCard.verified')}
            </span>
          ) : (
            <span className="badge badge-unverified">
              <Clock size={13} />
              {t('workerCard.unverified')}
            </span>
          )}

          {/* Availability Status */}
          {renderAvailabilityBadge(worker.availabilityStatus)}

          {/* e-Shram Card if registered */}
          {worker.eShramUan && (
            <span className="badge badge-eshram" title={`e-Shram Reference: ${worker.eShramUan}`}>
              <CreditCard size={12} />
              {t('workerCard.eShram')}
            </span>
          )}
        </div>

        {/* Rating Stars */}
        <div className="worker-rating-row">
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                fill={star <= Math.round(worker.rating || 0) ? '#f59e0b' : 'none'}
                stroke="#f59e0b"
              />
            ))}
          </div>
          {worker.ratingCount > 0 ? (
            <>
              <span className="star-rating-score">{worker.rating}</span>
              <span className="star-rating-count">
                ({worker.ratingCount} {t('workerCard.reviewsCount')})
              </span>
            </>
          ) : (
            <span className="star-rating-count" style={{ fontStyle: 'italic' }}>
              {t('workerCard.noRatings')}
            </span>
          )}
        </div>

        {/* Experience and Wage Details */}
        <div className="worker-details">
          <div className="worker-detail-item">
            <span className="label">{t('workerCard.experience')}</span>
            <span className="value">
              {worker.experienceYears} {t('workerCard.years')}
            </span>
          </div>
          <div className="worker-detail-item">
            <span className="label">{t('workerCard.dailyWage')}</span>
            <span className="value">
              ₹{worker.dailyWageMin} - ₹{worker.dailyWageMax}
            </span>
          </div>
        </div>

        {/* Short Bio / Tools note if present */}
        {worker.bio && (
          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              marginBottom: 12,
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {worker.bio}
          </p>
        )}
      </div>

      <div>
        {/* Strict Privacy Shield Notification - No Raw Phone Numbers */}
        <div className="privacy-mask-banner" role="note">
          <div className="privacy-mask-badge">
            <Lock size={14} />
            <span>{t('workerCard.phonePrivacy')}</span>
          </div>
        </div>

        {/* Primary CTA: Request Contact */}
        <button
          className="btn btn-primary btn-block"
          onClick={() => onRequestContact(worker)}
          aria-label={`Request contact details for ${worker.name}`}
        >
          <Phone size={15} />
          <span>{t('workerCard.requestContact')}</span>
        </button>
      </div>
    </article>
  );
};

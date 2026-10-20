import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { useToast } from './Toast';
import { rateWorker } from '../services/contactService';
import { X, Star, Send } from 'lucide-react';

export const RatingModal = ({ request, onClose, onRatingSubmitted }) => {
  const { t } = useI18n();
  const { addToast } = useToast();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState(request?.requesterName || '');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!request) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await rateWorker(request._id, {
        rating,
        comment,
        reviewerName,
      });
      addToast(t('ratingModal.successMsg'), 'success');
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to submit rating', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div>
            <h3>{t('ratingModal.title')}</h3>
            <p>{t('ratingModal.subtitle', { workerName: request.workerName })}</p>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Star Rating Picker */}
            <div className="form-group" style={{ textAlign: 'center', padding: '10px 0' }}>
              <label className="form-label" style={{ marginBottom: 12 }}>
                {t('ratingModal.starPrompt')}
              </label>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      transition: 'transform 0.1s ease',
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    aria-label={`${star} star`}
                  >
                    <Star
                      size={32}
                      fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'}
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                  </button>
                ))}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginTop: 6, display: 'block' }}>
                {hoverRating || rating} / 5 Stars
              </span>
            </div>

            {/* Reviewer Name */}
            <div className="form-group">
              <label className="form-label">{t('ratingModal.reviewerName')}</label>
              <input
                type="text"
                className="form-input"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
              />
            </div>

            {/* Feedback comment */}
            <div className="form-group">
              <label className="form-label">{t('ratingModal.commentLabel')}</label>
              <textarea
                className="form-textarea"
                placeholder={t('ratingModal.commentPlaceholder')}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              {t('ratingModal.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <Send size={15} />
              <span>{isSubmitting ? t('ratingModal.submitting') : t('ratingModal.submit')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { useToast } from '../components/Toast';
import { registerWorker } from '../services/workerService';
import {
  UserPlus,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Phone,
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  Send,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';

const DEFAULT_SKILLS = [
  'Mason',
  'Electrician',
  'Tailor',
  'Driver',
  'Welder',
  'Farm Laborer',
  'Plumber',
  'Carpenter',
  'Painter',
  'Cook',
  'Mechanic',
  'Blacksmith',
  'Potter',
  'Solar Technician',
  'Weaver',
];

const DEFAULT_VILLAGES = [
  'Shivpur',
  'Ramnagar',
  'Chandanwadi',
  'Pipla',
  'Belora',
  'Morgaon',
  'Khed',
  'Sonapur',
  'Wadgaon',
  'Jamthi',
  'Sultanpur',
  'Navapur',
  'Anjanvel',
  'Dhamangaon',
  'Shirkoli',
];

export const RegisterPage = ({ onGoToDirectory }) => {
  const { t } = useI18n();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    skillCategory: '',
    customSkill: '',
    village: '',
    customVillage: '',
    phone: '',
    availabilityStatus: 'available',
    experienceYears: 3,
    dailyWageMin: 500,
    dailyWageMax: 800,
    eShramUan: '',
    gender: 'Male',
    bio: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [createdWorker, setCreatedWorker] = useState(null);

  const validate = () => {
    const errors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Worker name must be at least 2 characters long';
    }

    const effectiveSkill = formData.skillCategory === 'Other' ? formData.customSkill : formData.skillCategory;
    if (!effectiveSkill || !effectiveSkill.trim()) {
      errors.skillCategory = 'Please select or enter a skill category';
    }

    const effectiveVillage = formData.village === 'Other' ? formData.customVillage : formData.village;
    if (!effectiveVillage || !effectiveVillage.trim()) {
      errors.village = 'Please select or enter a village name';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (formData.eShramUan.trim() && !/^[A-Za-z0-9- ]{10,24}$/.test(formData.eShramUan.trim())) {
      errors.eShramUan = 'e-Shram reference should be in UAN-XXXX-XXXX-XXXX format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      addToast('Please correct the errors in the form before submitting', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        skillCategory: formData.skillCategory === 'Other' ? formData.customSkill.trim() : formData.skillCategory,
        village: formData.village === 'Other' ? formData.customVillage.trim() : formData.village,
        phone: formData.phone.trim(),
        availabilityStatus: formData.availabilityStatus,
        experienceYears: Number(formData.experienceYears) || 1,
        dailyWageMin: Number(formData.dailyWageMin) || 400,
        dailyWageMax: Number(formData.dailyWageMax) || 800,
        eShramUan: formData.eShramUan.trim(),
        gender: formData.gender,
        bio: formData.bio.trim(),
      };

      const res = await registerWorker(payload);
      setCreatedWorker(res.worker);
      setRegisteredSuccess(true);
      addToast(t('registerPage.successTitle'), 'success');
    } catch (err) {
      console.error('Registration failed:', err);
      addToast(err.message || 'Worker registration failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      skillCategory: '',
      customSkill: '',
      village: '',
      customVillage: '',
      phone: '',
      availabilityStatus: 'available',
      experienceYears: 3,
      dailyWageMin: 500,
      dailyWageMax: 800,
      eShramUan: '',
      gender: 'Male',
      bio: '',
    });
    setFormErrors({});
    setRegisteredSuccess(false);
    setCreatedWorker(null);
  };

  return (
    <div className="main-content" style={{ maxWidth: 840 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <span
          className="badge"
          style={{ background: 'var(--primary-light)', color: 'var(--primary)', marginBottom: 8 }}
        >
          <UserPlus size={14} />
          {t('registerPage.badge')}
        </span>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: 6 }}>
          {t('registerPage.title')}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 600, margin: '0 auto' }}>
          {t('registerPage.subtitle')}
        </p>
      </div>

      {registeredSuccess ? (
        /* Success Screen */
        <div
          className="filter-card"
          style={{
            textAlign: 'center',
            padding: 40,
            borderTop: '4px solid var(--primary)',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircle2 size={44} />
          </div>

          <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: 8 }}>
            {t('registerPage.successTitle')}
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto 24px', lineHeight: 1.6 }}>
            {t('registerPage.successMsg')}
          </p>

          {createdWorker && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
                maxWidth: 420,
                margin: '0 auto 24px',
                textAlign: 'left',
              }}
            >
              <p>
                <strong>Name:</strong> {createdWorker.name}
              </p>
              <p>
                <strong>Skill:</strong> {createdWorker.skillCategory}
              </p>
              <p>
                <strong>Village:</strong> {createdWorker.village}
              </p>
              <p>
                <strong>Status:</strong> {createdWorker.availabilityStatus}
              </p>
              <p style={{ fontSize: '0.82rem', color: '#15803d', marginTop: 6, fontWeight: 600 }}>
                🔒 Phone number safely masked on public registry.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" onClick={onGoToDirectory}>
              <span>{t('registerPage.goToDirectory')}</span>
              <ArrowRight size={16} />
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleResetForm}>
              <RotateCcw size={15} />
              <span>{t('registerPage.registerAnother')}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Registration Form */
        <form onSubmit={handleSubmit} className="filter-card" style={{ padding: 28 }}>
          {/* Privacy & Safety Guarantee */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              display: 'flex',
              gap: 12,
              marginBottom: 24,
              fontSize: '0.85rem',
              color: '#166534',
            }}
          >
            <ShieldCheck size={22} style={{ flexShrink: 0, marginTop: 2, color: '#15803d' }} />
            <div>
              <strong>Privacy Protection Guarantee:</strong> {t('registerPage.phoneHint')}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {/* Worker Full Name */}
            <div className="form-group">
              <label className="form-label">{t('registerPage.fullName')}</label>
              <input
                type="text"
                className={`form-input ${formErrors.name ? 'input-error' : ''}`}
                placeholder={t('registerPage.namePlaceholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {formErrors.name && <span className="form-error">{formErrors.name}</span>}
            </div>

            {/* Mobile Number */}
            <div className="form-group">
              <label className="form-label">{t('registerPage.phone')}</label>
              <input
                type="tel"
                className={`form-input ${formErrors.phone ? 'input-error' : ''}`}
                placeholder={t('registerPage.phonePlaceholder')}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                maxLength={13}
              />
              {formErrors.phone ? (
                <span className="form-error">{formErrors.phone}</span>
              ) : (
                <span className="form-hint">10 digits (e.g. 9822104590)</span>
              )}
            </div>

            {/* Skill Category */}
            <div className="form-group">
              <label className="form-label">{t('registerPage.skillCategory')}</label>
              <select
                className={`form-select ${formErrors.skillCategory ? 'input-error' : ''}`}
                value={formData.skillCategory}
                onChange={(e) => setFormData({ ...formData, skillCategory: e.target.value })}
              >
                <option value="">{t('registerPage.selectSkill')}</option>
                {DEFAULT_SKILLS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value="Other">Other / अन्य कौशल्य...</option>
              </select>
              {formData.skillCategory === 'Other' && (
                <input
                  type="text"
                  className="form-input"
                  style={{ marginTop: 8 }}
                  placeholder="Enter specific skill or trade name"
                  value={formData.customSkill}
                  onChange={(e) => setFormData({ ...formData, customSkill: e.target.value })}
                />
              )}
              {formErrors.skillCategory && <span className="form-error">{formErrors.skillCategory}</span>}
            </div>

            {/* Village */}
            <div className="form-group">
              <label className="form-label">{t('registerPage.village')}</label>
              <select
                className={`form-select ${formErrors.village ? 'input-error' : ''}`}
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              >
                <option value="">{t('registerPage.selectVillage')}</option>
                {DEFAULT_VILLAGES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
                <option value="Other">Other Village / अन्य गाव...</option>
              </select>
              {formData.village === 'Other' && (
                <input
                  type="text"
                  className="form-input"
                  style={{ marginTop: 8 }}
                  placeholder={t('registerPage.orNewVillage')}
                  value={formData.customVillage}
                  onChange={(e) => setFormData({ ...formData, customVillage: e.target.value })}
                />
              )}
              {formErrors.village && <span className="form-error">{formErrors.village}</span>}
            </div>

            {/* Availability Status */}
            <div className="form-group">
              <label className="form-label">{t('registerPage.availability')}</label>
              <select
                className="form-select"
                value={formData.availabilityStatus}
                onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value })}
              >
                <option value="available">{t('search.availableNow')}</option>
                <option value="busy">{t('search.busy')}</option>
                <option value="seasonal">{t('search.seasonal')}</option>
                <option value="on_leave">{t('search.onLeave')}</option>
              </select>
            </div>

            {/* Experience in Years */}
            <div className="form-group">
              <label className="form-label">{t('registerPage.experience')}</label>
              <input
                type="number"
                min="0"
                max="50"
                className="form-input"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
              />
            </div>

            {/* Expected Daily Wage Min */}
            <div className="form-group">
              <label className="form-label">{t('registerPage.wageMin')}</label>
              <input
                type="number"
                min="200"
                step="50"
                className="form-input"
                value={formData.dailyWageMin}
                onChange={(e) => setFormData({ ...formData, dailyWageMin: e.target.value })}
              />
            </div>

            {/* Expected Daily Wage Max */}
            <div className="form-group">
              <label className="form-label">{t('registerPage.wageMax')}</label>
              <input
                type="number"
                min="200"
                step="50"
                className="form-input"
                value={formData.dailyWageMax}
                onChange={(e) => setFormData({ ...formData, dailyWageMax: e.target.value })}
              />
            </div>

            {/* Gender */}
            <div className="form-group">
              <label className="form-label">{t('registerPage.gender')}</label>
              <select
                className="form-select"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male / पुरुष</option>
                <option value="Female">Female / महिला</option>
                <option value="Other">Other / इतर</option>
                <option value="Not Specified">Prefer Not to Say</option>
              </select>
            </div>

            {/* e-Shram Reference */}
            <div className="form-group">
              <label className="form-label">{t('registerPage.eShram')}</label>
              <input
                type="text"
                className={`form-input ${formErrors.eShramUan ? 'input-error' : ''}`}
                placeholder={t('registerPage.eShramPlaceholder')}
                value={formData.eShramUan}
                onChange={(e) => setFormData({ ...formData, eShramUan: e.target.value })}
              />
              {formErrors.eShramUan ? (
                <span className="form-error">{formErrors.eShramUan}</span>
              ) : (
                <span className="form-hint">{t('registerPage.eShramHint')}</span>
              )}
            </div>
          </div>

          {/* Tools and Specialization */}
          <div className="form-group" style={{ marginTop: 20 }}>
            <label className="form-label">{t('registerPage.bio')}</label>
            <textarea
              className="form-textarea"
              placeholder={t('registerPage.bioPlaceholder')}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetForm}
              disabled={isSubmitting}
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <Send size={15} />
              <span>{isSubmitting ? t('registerPage.submitting') : t('registerPage.submit')}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

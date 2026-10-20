import React from 'react';
import { useI18n } from '../i18n';
import { Shield, Award, HeartHandshake } from 'lucide-react';

export const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', color: '#cbd5e1' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
            <Shield size={16} style={{ color: '#4ade80' }} />
            {t('footer.privacyCommitment')}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
            <Award size={16} style={{ color: '#facc15' }} />
            {t('app.panchayatAffiliation')}
          </span>
        </div>

        <p style={{ maxWidth: 700, margin: '0 auto', lineHeight: 1.6 }}>
          {t('footer.projectNotice')}
        </p>

        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {t('footer.copyright')}
        </p>
      </div>
    </footer>
  );
};

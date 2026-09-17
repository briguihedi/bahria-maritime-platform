import { useTranslation } from 'react-i18next';

export default function CtaBanner({ onOpenAuth }) {
  const { t } = useTranslation();

  return (
    <div id="cta-banner">
      <div className="cta-photo">
        <img src="/background.png" alt="Transport maritime" />
      </div>
      <div className="cta-content">
        <div className="section-tag fade-up">{t('cta.tag')}</div>
        <h2 className="fade-up d1">{t('cta.title')}</h2>
        <p className="fade-up d2">{t('cta.desc')}</p>
        <div className="cta-btns fade-up d3">
          <button className="btn-gold btn-lg" onClick={() => onOpenAuth('signup')}>
            {t('cta.btn1')}
          </button>
          <a href="#contact" className="btn-outline btn-lg" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            {t('cta.btn2')}
          </a>
        </div>
      </div>
    </div>
  );
}
import { useTranslation } from 'react-i18next';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function About() {
  const { t } = useTranslation();
  const ref = useScrollAnimation();

  return (
    <section id="about" ref={ref}>
      <div className="section-inner">
        <div className="about-grid">
          <div className="about-photo-wrap fade-up d1">
            <img src="/bahriaa.png" alt="Port maritime Sousse" className="about-photo-main" />
            <img src="/bahria1.png"  alt="Port de Bizerte"      className="about-photo-float" />
            <div className="about-badge"><span className="num">20+</span> {t('about.badge')}</div>
          </div>

          <div className="fade-up d3">
            <div className="section-tag">{t('about.tag')}</div>
            <h2 className="section-title">{t('about.title')}</h2>
            <div className="gold-line" style={{ margin: '16px 0 28px' }} />
            <p style={{ color: 'var(--gray)', fontSize: 15, lineHeight: 1.85, marginBottom: 20 }}>
              {t('about.p1')}
            </p>
            <p style={{ color: 'var(--gray)', fontSize: 15, lineHeight: 1.85, marginBottom: 36 }}>
              {t('about.p2')}
            </p>
            <div className="stat-mini-grid">
              <div className="stat-mini-box" style={{ background: 'rgba(201,168,76,.06)', border: '1px solid var(--border-gold)' }}>
                <div className="stat-mini-num" style={{ color: 'var(--gold)' }}>3.2M</div>
                <div className="stat-mini-label">{t('about.stat1')}</div>
              </div>
              <div className="stat-mini-box" style={{ background: 'rgba(11,180,176,.06)', border: '1px solid rgba(11,180,176,.15)' }}>
                <div className="stat-mini-num" style={{ color: 'var(--teal)' }}>4</div>
                <div className="stat-mini-label">{t('about.stat2')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
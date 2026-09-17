import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function Hero({ onOpenAuth }) {
  const { t } = useTranslation();
  const counterRef = useRef(null);

  useEffect(() => {
    const el = counterRef.current;
    if (!el) return;
    let n = 0;
    const timer = setInterval(() => {
      n = Math.min(n + 0.4, 20);
      el.textContent = Math.round(n) + (n >= 20 ? '+' : '');
      if (n >= 20) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="hero">
      {/* Background photo */}
      <div className="hero-photo">
        <img
          src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1600&q=80"
          alt="Port maritime"
        />
      </div>
      <div className="hero-overlay" />
      <div className="hero-overlay2" />
      <div className="hero-grid" />

      {/* Waves */}
      <div className="hero-waves">
        <svg viewBox="0 0 1440 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="hero-wave1">
          <path d="M0,80 C360,160 1080,0 1440,80 L1440,180 L0,180 Z" fill="rgba(7,14,28,0.6)" />
        </svg>
        <svg viewBox="0 0 1440 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="hero-wave2">
          <path d="M0,100 C480,20 960,160 1440,100 L1440,180 L0,180 Z" fill="rgba(7,14,28,0.8)" />
        </svg>
      </div>

      <div className="hero-content">
        <div className="hero-eyebrow fade-up">
          <div className="hero-dot" />
          <span>{t('hero.tag')}</span>
        </div>

        <h1 className="hero-title fade-up d1">
          <span className="line1">{t('hero.title1')}</span>
          <span className="line2">{t('hero.title2')}</span>
        </h1>

        <p className="hero-desc fade-up d2">{t('hero.desc')}</p>
        <p className="hero-desc-en fade-up d2">Maritime Transport · Customs Clearance · Multimodal Logistics</p>

        <div className="hero-actions fade-up d3">
          <button className="btn-gold btn-lg" onClick={() => onOpenAuth('signup')}>
            {t('hero.btn1')}
          </button>
          <a href="#services" className="btn-outline btn-lg" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            {t('hero.btn2')}
          </a>
        </div>

        <div className="hero-stats fade-up d4">
          <div className="stat-item">
            <div className="stat-num"><span ref={counterRef}>0</span></div>
            <div className="stat-label">{t('hero.stat1')}</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">4</div>
            <div className="stat-label">{t('hero.stat2')}</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">2</div>
            <div className="stat-label">{t('hero.stat3')}</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">24/7</div>
            <div className="stat-label">{t('hero.stat4')}</div>
          </div>
        </div>
      </div>

      <div className="hero-scroll">
        <span>{t('hero.scroll')}</span>
        <div className="hero-scroll-arrow" />
      </div>
    </section>
  );
}
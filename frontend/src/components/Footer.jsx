import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-brand-name">GROUPE BAHRIA</div>
            <div className="footer-brand-sub">Transport Maritime & Logistique</div>
            <p>{t('footer.desc')}</p>
            <p style={{ color: 'var(--dark-gray)', fontSize: 13, marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={14} strokeWidth={1.5} color="var(--gold)" />
                Zone Industrielle Sidi Abdelhamid, 4061 Sousse
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={14} strokeWidth={1.5} color="var(--gold)" />
                +216 73 322 518
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={14} strokeWidth={1.5} color="var(--gold)" />
                commercial@smcbahria.com
              </span>
            </p>
          </div>

          <div className="footer-col">
            <h4>{t('footer.services')}</h4>
            <a href="#services">Transport Maritime</a>
            <a href="#services">Dédouanement</a>
            <a href="#services">Manutention & Levage</a>
            <a href="#services">Magasin Sous Douane</a>
            <a href="#services">Transport Terrestre</a>
            <a href="#services">Acconage Portuaire</a>
          </div>

          <div className="footer-col">
            <h4>{t('footer.group')}</h4>
            <a href="#group">SMC Bahria</a>
            <a href="#group">Universal Transit</a>
            <a href="#group">Bahria Schuch</a>
            <a href="#group">STUMAR</a>
            <a href="#about">Notre Histoire</a>
          </div>

          <div className="footer-col">
            <h4>{t('footer.info')}</h4>
            <a href="#documents">Documents</a>
            <a href="#portal">Espace Client</a>
            <a href="#contact">Contact</a>
            <a href="#">Mentions légales</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {year} Groupe BAHRIA (SMC Bahria) · {t('footer.rights')} · Sousse, Tunisie</p>
          <p style={{ color: 'var(--dark-gray)', fontSize: 12 }}>RC: B184562012 · MF: 1234567/A</p>
        </div>
      </div>
    </footer>
  );
}
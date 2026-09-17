import { useTranslation } from 'react-i18next';
import { Package, FileText, MessageCircle, BarChart3 } from 'lucide-react';

export default function Portal({ onOpenAuth }) {
  const { t } = useTranslation();

  const shipments = [
    { id: 'BHR-2024-0847', status: 'En transit',   statusColor: '#0BB4B0', statusBg: 'rgba(11,180,176,.15)',  progress: 72,  eta: 'ETA: 14 Jan 2025 · Port de Sousse' },
    { id: 'BHR-2024-0831', status: 'Dédouanement', statusColor: '#C9A84C', statusBg: 'rgba(201,168,76,.15)',  progress: 45,  eta: 'En cours de traitement · SINDA' },
    { id: 'BHR-2024-0819', status: 'Livré',         statusColor: '#4ADE80', statusBg: 'rgba(74,222,128,.15)', progress: 100, eta: 'Livré le 08 Jan 2025 · Sfax' },
  ];

  const features = [
    { icon: <Package size={20} strokeWidth={1.5} color="var(--gold)" />,       text: t('portal.f1') },
    { icon: <FileText size={20} strokeWidth={1.5} color="var(--gold)" />,      text: t('portal.f2') },
    { icon: <MessageCircle size={20} strokeWidth={1.5} color="var(--gold)" />, text: t('portal.f3') },
    { icon: <BarChart3 size={20} strokeWidth={1.5} color="var(--gold)" />,     text: t('portal.f4') },
  ];

  return (
    <section id="portal">
      <div className="section-inner">
        <div className="portal-inner">
          <div className="portal-glow" />
          <div>
            <div className="section-tag fade-up">{t('portal.tag')}</div>
            <h2 className="portal-title fade-up d1">
              {t('portal.title1')} <span>{t('portal.title2')}</span>
            </h2>
            <p className="portal-desc fade-up d2">{t('portal.desc')}</p>
            <div className="portal-actions fade-up d3">
              <button className="btn-gold" onClick={() => onOpenAuth('signup')}>{t('portal.btn1')}</button>
              <button className="btn-outline" onClick={() => onOpenAuth('login')}>{t('portal.btn2')}</button>
            </div>
            <div className="portal-features fade-up d4">
              {features.map((f, i) => (
                <div className="portal-feature" key={i}>
                  <div className="portal-feature-icon">{f.icon}</div>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-mock fade-up d2">
            <div className="dash-bar">
              <div className="dash-dot" style={{ background: '#FF5F57' }} />
              <div className="dash-dot" style={{ background: '#FEBC2E' }} />
              <div className="dash-dot" style={{ background: '#28C840' }} />
              <span className="dash-title">Bahria Client Portal</span>
            </div>
            <div className="dash-body">
              <div className="dash-section-label">{t('portal.dashLabel')}</div>
              {shipments.map((s, i) => (
                <div className="dash-shipment" key={i}>
                  <div className="dash-ship-header">
                    <span className="dash-ship-id">{s.id}</span>
                    <span className="dash-ship-badge" style={{ color: s.statusColor, background: s.statusBg }}>{s.status}</span>
                  </div>
                  <div className="dash-progress">
                    <div className="dash-bar-fill" style={{ '--w': `${s.progress}%`, width: `${s.progress}%`, background: s.statusColor }} />
                  </div>
                  <div className="dash-eta">{s.eta}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Ship, ShieldCheck, Construction, Warehouse, Truck, Anchor } from 'lucide-react';
import ServiceModal from './ServiceModal';

export default function Services({ onOpenAuth }) {
  const { t } = useTranslation();
  const ref = useScrollAnimation();
  const [openServiceId, setOpenServiceId] = useState(null);

  const SERVICES = [
    { id: 'transport-maritime',  icon: <Ship size={46} strokeWidth={1.5} color="var(--gold)" />,         title: t('services.s1.title'), sub: t('services.s1.sub'), desc: t('services.s1.desc') },
    { id: 'dedouanement',        icon: <ShieldCheck size={46} strokeWidth={1.5} color="var(--gold)" />,  title: t('services.s2.title'), sub: t('services.s2.sub'), desc: t('services.s2.desc') },
    { id: 'manutention-levage',  icon: <Construction size={46} strokeWidth={1.5} color="var(--gold)" />, title: t('services.s3.title'), sub: t('services.s3.sub'), desc: t('services.s3.desc') },
    { id: 'magasin-sous-douane', icon: <Warehouse size={46} strokeWidth={1.5} color="var(--gold)" />,   title: t('services.s4.title'), sub: t('services.s4.sub'), desc: t('services.s4.desc') },
    { id: 'transport-terrestre', icon: <Truck size={46} strokeWidth={1.5} color="var(--gold)" />,        title: t('services.s5.title'), sub: t('services.s5.sub'), desc: t('services.s5.desc') },
    { id: 'acconage-portuaire',  icon: <Anchor size={46} strokeWidth={1.5} color="var(--gold)" />,       title: t('services.s6.title'), sub: t('services.s6.sub'), desc: t('services.s6.desc') },
  ];

  return (
    <>
      <section id="services" ref={ref}>
        <div className="section-inner">
          <div className="section-header center fade-up">
            <div className="section-tag">{t('services.tag')}</div>
            <h2 className="section-title">
              {t('services.title')}<br />
              <span style={{ color: 'var(--gold)' }}>{t('services.titleGold')}</span>
            </h2>
            <div className="gold-line center" />
          </div>

          <div className="services-grid">
            {SERVICES.map((s, i) => (
              <div className={`service-card fade-up d${(i % 3) + 1}`} key={i}
                style={{ cursor: 'pointer' }}
                onClick={() => setOpenServiceId(s.id)}>
                <div className="service-icon">{s.icon}</div>
                <div className="service-title">{s.title}</div>
                <div className="service-sub">{s.sub}</div>
                <p className="service-desc">{s.desc}</p>
                <div className="service-link">{t('services.more')} <span>→</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {openServiceId && (
        <ServiceModal
          serviceId={openServiceId}
          onClose={() => setOpenServiceId(null)}
          onOpenAuth={onOpenAuth}
        />
      )}
    </>
  );
}
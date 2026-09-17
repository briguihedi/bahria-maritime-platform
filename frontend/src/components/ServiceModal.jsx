import { useEffect } from 'react';
import { X, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import servicesData from '../data/servicesData';

export default function ServiceModal({ serviceId, onClose, onOpenAuth }) {
  const service = servicesData.find(s => s.id === serviceId);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!service) return null;
  const Icon = service.icon;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 5000,
        background: 'rgba(0,0,0,.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'fadeInOverlay .25s ease',
      }}
    >
      <style>{`
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { opacity: 0; transform: translateY(40px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modal-scroll::-webkit-scrollbar { width: 4px; }
        .modal-scroll::-webkit-scrollbar-track { background: transparent; }
        .modal-scroll::-webkit-scrollbar-thumb { background: rgba(201,168,76,.2); border-radius: 10px; }
        .adv-card { transition: all .2s ease; }
        .adv-card:hover { transform: translateX(6px); }
        .step-card { transition: all .2s ease; }
        .step-card:hover { transform: translateY(-4px); }
        .close-btn:hover { background: rgba(255,255,255,.1) !important; transform: rotate(90deg); }
        .close-btn { transition: all .25s ease; }
        .cta-btn-main:hover { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,.3); }
        .cta-btn-main { transition: all .2s ease; }
      `}</style>

      <div style={{
        width: '100%', maxWidth: 860,
        maxHeight: '90vh',
        background: 'linear-gradient(160deg, #0A1628 0%, #0D1F3C 50%, #070E1C 100%)',
        border: `1px solid ${service.color}25`,
        borderRadius: 28,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: `0 40px 80px rgba(0,0,0,.6), 0 0 0 1px ${service.color}10, inset 0 1px 0 rgba(255,255,255,.05)`,
        animation: 'slideUpModal .35s cubic-bezier(.4,0,.2,1)',
        position: 'relative',
      }}>

        {/* Background glow */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${service.color}06 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${service.color}04 1px, transparent 1px), linear-gradient(90deg, ${service.color}04 1px, transparent 1px)`, backgroundSize: '50px 50px', pointerEvents: 'none' }} />

        {/* ── HEADER ── */}
        <div style={{ padding: '32px 36px 28px', borderBottom: `1px solid ${service.color}15`, position: 'relative', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {/* Icon circle */}
              <div style={{ width: 68, height: 68, borderRadius: 20, background: service.bg, border: `1px solid ${service.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 30% 30%, ${service.color}15, transparent 60%)` }} />
                <Icon size={32} strokeWidth={1.2} color={service.color} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ fontSize: 10, color: service.color, letterSpacing: 3, fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', background: service.bg, borderRadius: 20, border: `1px solid ${service.color}25` }}>
                    {service.subtitle}
                  </div>
                </div>
                <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: 32, fontWeight: 700, color: 'var(--white)', lineHeight: 1, margin: 0 }}>
                  {service.title}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--gray)', marginTop: 6, fontStyle: 'italic' }}>"{service.tagline}"</p>
              </div>
            </div>

            {/* Close button */}
            <button onClick={onClose} className="close-btn" style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'var(--gray)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          {/* Stats bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 24 }}>
            {service.stats.map((stat, i) => (
              <div key={i} style={{ padding: '14px 16px', background: 'rgba(255,255,255,.03)', border: `1px solid ${service.color}15`, borderRadius: 14, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--ff-display)', fontSize: 28, fontWeight: 700, color: service.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 4, lineHeight: 1.4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div className="modal-scroll" style={{ flex: 1, overflowY: 'auto', padding: '28px 36px' }}>

          {/* Description */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: service.color, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>Description</div>
            {service.description.split('\n\n').map((para, i) => (
              <p key={i} style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.85, marginBottom: 14 }}>{para}</p>
            ))}
          </div>

          {/* Process steps */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: service.color, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700, marginBottom: 20 }}>Notre processus</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 24, left: '12.5%', right: '12.5%', height: 1, background: `linear-gradient(90deg, ${service.color}30, ${service.color}10)`, pointerEvents: 'none' }} />
              {service.steps.map((step, i) => (
                <div key={i} className="step-card" style={{ textAlign: 'center', padding: '18px 12px', background: 'rgba(13,31,60,.6)', border: `1px solid ${service.color}15`, borderRadius: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: service.bg, border: `2px solid ${service.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', position: 'relative', zIndex: 1 }}>
                    <span style={{ fontFamily: 'var(--ff-display)', fontSize: 16, fontWeight: 700, color: service.color }}>{step.num}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginBottom: 6 }}>{step.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray)', lineHeight: 1.6 }}>{step.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Advantages + Documents side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>

            {/* Advantages */}
            <div>
              <div style={{ fontSize: 11, color: service.color, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>Nos avantages</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {service.advantages.map((adv, i) => (
                  <div key={i} className="adv-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: 'rgba(13,31,60,.5)', border: `1px solid ${service.color}12`, borderRadius: 10 }}>
                    <CheckCircle size={14} strokeWidth={1.5} color={service.color} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 12, color: 'var(--gray)', lineHeight: 1.6 }}>{adv}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div>
              <div style={{ fontSize: 11, color: service.color, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                <FileText size={12} strokeWidth={2} /> Documents requis
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {service.documents.map((doc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: service.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--white)' }}>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER CTA ── */}
        <div style={{ padding: '20px 36px', borderTop: `1px solid ${service.color}15`, background: 'rgba(7,14,28,.6)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 2 }}>Intéressé par ce service ?</div>
            <div style={{ fontSize: 12, color: 'var(--gray)' }}>Notre équipe vous répond sous 24h.</div>
          </div>
          <button onClick={() => { onClose(); onOpenAuth('signup'); }} className="cta-btn-main"
            style={{ padding: '12px 28px', background: `linear-gradient(135deg, ${service.color}, ${service.color}cc)`, border: 'none', borderRadius: 12, color: 'var(--navy-deep)', fontWeight: 700, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            Demander un devis <ArrowRight size={16} strokeWidth={2} />
          </button>
          <button onClick={() => { onClose(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
            style={{ padding: '12px 22px', background: 'transparent', border: `1px solid ${service.color}30`, borderRadius: 12, color: service.color, fontWeight: 600, cursor: 'pointer', fontSize: 13, flexShrink: 0, transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = service.bg; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
            Nous contacter
          </button>
        </div>
      </div>
    </div>
  );
}
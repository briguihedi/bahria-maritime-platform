import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useTranslation } from 'react-i18next';

export default function Group() {
  const { t } = useTranslation();
  const ref = useScrollAnimation();

  const SUBSIDIARIES = [
    { 
      color: 'sub-teal',   
      since: 'Depuis 2004', 
      name: 'SMC BAHRIA',                
      role: t('group.s1.role'),   
      logo: '/smc.png',
      desc: t('group.s1.desc'), 
      tags: [t('group.s1.t1'), t('group.s1.t2'), t('group.s1.t3'), t('group.s1.t4')] 
    },
    { 
      color: 'sub-gold',   
      since: 'Depuis 2004', 
      name: 'UNIVERSAL TRANSIT',          
      role: t('group.s2.role'),    
      logo: '/universel.png',
      desc: t('group.s2.desc'), 
      tags: [t('group.s2.t1'), t('group.s2.t2'), t('group.s2.t3'), t('group.s2.t4')] 
    },
    { 
      color: 'sub-orange', 
      since: 'Depuis 2008', 
      name: 'BAHRIA SCHUCH MAINTENANCE',  
      role: t('group.s3.role'),         
      logo: '/bahria.png',
      desc: t('group.s3.desc'), 
      tags: [t('group.s3.t1'), t('group.s3.t2'), t('group.s3.t3'), t('group.s3.t4')] 
    },
    { 
      color: 'sub-purple', 
      since: 'Concessionnaire', 
      name: 'STUMAR',                 
      role: t('group.s4.role'),     
      logo: '/stumar.png',
      desc: t('group.s4.desc'), 
      tags: [t('group.s4.t1'), t('group.s4.t2'), t('group.s4.t3'), t('group.s4.t4')] 
    },
  ];

  return (
    <section id="group" ref={ref}>
      <div className="section-inner">
        <div className="group-intro">
          <div className="section-header fade-up">
            <div className="section-tag">{t('group.tag')}</div>
            <h2 className="section-title">{t('group.title1')}<br /><span style={{ color: 'var(--gold)' }}>{t('group.title2')}</span></h2>
            <div className="gold-line" style={{ marginTop: 16 }} />
          </div>
          <div className="fade-up d2" style={{ paddingTop: 60 }}>
            <p style={{ color: 'var(--gray)', fontSize: 15, lineHeight: 1.85, marginBottom: 18 }}>{t('group.p1')}</p>
            <p style={{ color: 'var(--gray)', fontSize: 15, lineHeight: 1.85 }}>{t('group.p2')}</p>
          </div>
        </div>

        <div className="subsidiaries-grid">
          {SUBSIDIARIES.map((s, i) => (
            <div className={`sub-card ${s.color} fade-up d${i + 1}`} key={i}>
              <div className="sub-card-accent" />
              <div className="sub-card-glow" />
              <div className="sub-header">
                <div className="sub-logo-wrap" style={{
                  borderRadius: '10px',
                  padding: '8px',
                  height: '90px',    
                  width: '140px',     
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={s.logo} 
                    alt={s.name}
                    style={{ height: '100%', width: '100%', objectFit: 'contain', mixBlendMode: 'darken' }} 
                  />
                </div>
                <div className="sub-title-group">
                  <div className="sub-since">{s.since}</div>
                  <div className="sub-name">{s.name}</div>
                  <div className="sub-role">{s.role}</div>
                </div>
              </div>
              <p className="sub-desc">{s.desc}</p>
              <div className="sub-tags">
                {s.tags.map(tag => <span className="sub-tag" key={tag}>{tag}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
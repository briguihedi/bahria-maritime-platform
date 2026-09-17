import { useTranslation } from 'react-i18next';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { ClipboardList, Ship, FileText, Globe, CheckCircle, FlaskConical, BarChart3, Monitor, ScrollText } from 'lucide-react';

const DOCS = [
  { icon: <ClipboardList size={36} strokeWidth={1.5} color="var(--gold)" />, nameKey: 'documents.d1.name', descKey: 'documents.d1.desc' },
  { icon: <Ship size={36} strokeWidth={1.5} color="var(--gold)" />,          nameKey: 'documents.d2.name', descKey: 'documents.d2.desc' },
  { icon: <FileText size={36} strokeWidth={1.5} color="var(--gold)" />,      nameKey: 'documents.d3.name', descKey: 'documents.d3.desc' },
  { icon: <Globe size={36} strokeWidth={1.5} color="var(--gold)" />,         nameKey: 'documents.d4.name', descKey: 'documents.d4.desc' },
  { icon: <CheckCircle size={36} strokeWidth={1.5} color="var(--gold)" />,   nameKey: 'documents.d5.name', descKey: 'documents.d5.desc' },
  { icon: <FlaskConical size={36} strokeWidth={1.5} color="var(--gold)" />,  nameKey: 'documents.d6.name', descKey: 'documents.d6.desc' },
  { icon: <BarChart3 size={36} strokeWidth={1.5} color="var(--gold)" />,     nameKey: 'documents.d7.name', descKey: 'documents.d7.desc' },
  { icon: <Monitor size={36} strokeWidth={1.5} color="var(--gold)" />,       nameKey: 'documents.d8.name', descKey: 'documents.d8.desc' },
  { icon: <ScrollText size={36} strokeWidth={1.5} color="var(--gold)" />,    nameKey: 'documents.d9.name', descKey: 'documents.d9.desc' },
];

export default function Documents() {
  const { t } = useTranslation();
  const ref = useScrollAnimation();

  return (
    <section id="documents" ref={ref}>
      <div className="section-inner">
        <div className="section-header center fade-up">
          <div className="section-tag">{t('documents.tag')}</div>
          <h2 className="section-title">
            {t('documents.title1')} <span style={{ color: 'var(--gold)' }}>{t('documents.title2')}</span>
          </h2>
          <div className="gold-line center" />
          <p style={{ color: 'var(--gray)', fontSize: 15, maxWidth: 600, margin: '24px auto 0', lineHeight: 1.8 }}>
            {t('documents.desc')}
          </p>
        </div>
        <div className="docs-grid">
          {DOCS.map((d, i) => (
            <div className={`doc-card fade-up d${(i % 3) + 1}`} key={i}>
              <div className="doc-icon">{d.icon}</div>
              <div className="doc-name">{t(d.nameKey)}</div>
              <p className="doc-desc">{t(d.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
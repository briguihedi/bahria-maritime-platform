import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { MapPin, Phone, Mail, Clock, Loader2 } from 'lucide-react';

export default function Contact() {
  const { t } = useTranslation();
  const ref = useScrollAnimation();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', company: '', service: '', message: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.firstName || !form.email || !form.message) { setStatus('fields'); return; }
    setLoading(true); setStatus(null);
    try {
      await api.post('/contact', form);
      setStatus('success');
      setForm({ firstName: '', lastName: '', email: '', company: '', service: '', message: '' });
    } catch { setStatus('error'); }
    finally { setLoading(false); }
  };

  const INFO = [
    { icon: <MapPin size={22} strokeWidth={1.5} color="var(--gold)" />,  label: t('contact.tag'), value: t('contact.address') },
    { icon: <Phone size={22} strokeWidth={1.5} color="var(--gold)" />,   label: 'Téléphone',      value: '+216 73 322 518\n+216 73 322 778' },
    { icon: <Mail size={22} strokeWidth={1.5} color="var(--gold)" />,    label: 'Email',          value: 'commercial@smcbahria.com' },
    { icon: <Clock size={22} strokeWidth={1.5} color="var(--gold)" />,   label: 'Horaires',       value: t('contact.hours') },
  ];

  const SERVICES = [
    'Transport Maritime', 'Dédouanement', 'Manutention & Levage',
    'Magasin Sous Douane', 'Transport Terrestre', 'Acconage Portuaire', 'Autre',
  ];

  return (
    <section id="contact" ref={ref}>
      <div className="section-inner">
        <div className="section-header center fade-up">
          <div className="section-tag">{t('contact.tag')}</div>
          <h2 className="section-title">
            {t('contact.title1')} <span style={{ color: 'var(--gold)' }}>{t('contact.title2')}</span>
          </h2>
          <div className="gold-line center" />
        </div>

        <div className="contact-grid">
          <div className="fade-up d1">
            <p style={{ color: 'var(--gray)', fontSize: 15, lineHeight: 1.85, marginBottom: 40 }}>
              {t('contact.intro')}
            </p>
            {INFO.map((item, i) => (
              <div className="contact-info-item" key={i}>
                <div className="contact-info-icon">{item.icon}</div>
                <div>
                  <div className="contact-info-label">{item.label}</div>
                  <div className="contact-info-value" style={{ whiteSpace: 'pre-line' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="contact-form fade-up d2">
            <h3>{t('contact.formTitle')}</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('contact.firstName')} *</label>
                <input className="form-input" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Mohamed" />
              </div>
              <div className="form-group">
                <label className="form-label">{t('contact.lastName')}</label>
                <input className="form-input" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Ben Ali" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('contact.email')} *</label>
              <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="votre@email.com" />
            </div>
            <div className="form-group">
              <label className="form-label">{t('contact.company')}</label>
              <input className="form-input" name="company" value={form.company} onChange={handleChange} placeholder="Votre entreprise" />
            </div>
            <div className="form-group">
              <label className="form-label">{t('contact.service')}</label>
              <select className="form-input" name="service" value={form.service} onChange={handleChange}>
                <option value="">{t('contact.selectService')}</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('contact.message')} *</label>
              <textarea className="form-input" name="message" value={form.message} onChange={handleChange} placeholder="Décrivez votre besoin..." />
            </div>
            <button className="btn-gold btn-form" onClick={handleSubmit} disabled={loading}>
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Loader2 size={18} className="spin" /> {t('contact.sending')}
                  </span>
                : t('contact.send')
              }
            </button>
            {status === 'success' && <p className="form-success">{t('contact.success')}</p>}
            {status === 'error'   && <p className="form-error">{t('contact.error')}</p>}
            {status === 'fields'  && <p className="form-error">{t('contact.fields')}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
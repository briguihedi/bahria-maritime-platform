import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AIAssistant from '../components/AIAssistant';
import api from '../utils/api';
import {
  Home, Ship, FileEdit, MessageCircle, Bell, FileText,
  Bot, User, Anchor, Package, CheckCircle, MapPin,
  Calendar, Scale, ClipboardList, Globe, Monitor, Phone, Mail,
  Send, Loader2, X, LogOut, ArrowLeft, Plus, Eye, DollarSign
} from 'lucide-react';

const STATUS_COLORS = {
  'En transit':   { color: '#0BB4B0', bg: 'rgba(11,180,176,.15)' },
  'Dédouanement': { color: '#C9A84C', bg: 'rgba(201,168,76,.15)' },
  'En attente':   { color: '#8899AA', bg: 'rgba(136,153,170,.15)' },
  'Livré':        { color: '#4ADE80', bg: 'rgba(74,222,128,.15)' },
};

const IC = ({ children, size = 16 }) => (
  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, flexShrink: 0 }}>{children}</span>
);

// ── TRANSIT SECTION COMPONENT ─────────────────────────────────────────────────
function TransitSection() {
  const { user } = useAuth();
  const [quotes, setQuotes]           = useState([]);
  const [loading, setLoading]         = useState(false);
  const [showForm, setShowForm]       = useState(false);
  const [detailQuote, setDetailQuote] = useState(null);
  const [toast, setToast]             = useState(null);
  const [formSending, setFormSending] = useState(false);
  const [formErrors, setFormErrors]   = useState({});

  const [form, setForm] = useState({
    service: '', origin: '', destination: '',
    cargo: '', weight: '', notes: '', deadline: '',
  });

  useEffect(() => { loadQuotes(); }, []);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/quotes/mine');
      setQuotes(data.quotes);
    } catch {}
    setLoading(false);
  };

  const validate = () => {
    const errors = {};
    if (!form.service)      errors.service     = 'Veuillez sélectionner un service.';
    if (!form.origin)       errors.origin      = "Le port d'origine est requis.";
    else if (form.origin.length < 3) errors.origin = 'Minimum 3 caractères.';
    if (!form.destination)  errors.destination = 'Le port de destination est requis.';
    else if (form.destination.length < 3) errors.destination = 'Minimum 3 caractères.';
    if (!form.deadline)     errors.deadline    = 'La date limite est requise.';
    else if (new Date(form.deadline) <= new Date()) errors.deadline = 'La date doit être dans le futur.';
    if (form.weight && (isNaN(Number(form.weight)) || Number(form.weight) <= 0)) 
  errors.weight = 'Le poids doit être un nombre positif.';
    return errors;
  };

  const submitForm = async () => {
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setFormSending(true);
    try {
      await api.post('/quotes', form);
      showToastMsg('Demande envoyée ! En attente de traitement.');
      setForm({ service: '', origin: '', destination: '', cargo: '', weight: '', notes: '', deadline: '' });
      setFormErrors({});
      setShowForm(false);
      loadQuotes();
    } catch (err) {
      showToastMsg(err.response?.data?.message || 'Erreur envoi.', 'error');
    }
    setFormSending(false);
  };

  const confirmQuote = async (id) => {
    try {
      await api.patch(`/quotes/${id}/confirm`);
      showToastMsg('Devis confirmé ! Votre transit est en cours.');
      loadQuotes();
    } catch (err) { showToastMsg(err.response?.data?.message || 'Erreur', 'error'); }
  };

  const cancelQuote = async (id) => {
    if (!window.confirm("Confirmer l'annulation de ce transit ?")) return;
    try {
      await api.patch(`/quotes/${id}/cancel`);
      showToastMsg('Transit annulé.');
      loadQuotes();
    } catch (err) { showToastMsg(err.response?.data?.message || 'Erreur', 'error'); }
  };

  const SECTIONS = [
    { key: 'soumis',        label: '🕐 En attente de devis',       color: '#8899AA', bg: 'rgba(136,153,170,.1)' },
    { key: 'devis_propose', label: '💰 Devis proposé',             color: '#C9A84C', bg: 'rgba(201,168,76,.1)'  },
    { key: 'en_cours',      label: '🚢 En cours',                  color: '#0BB4B0', bg: 'rgba(11,180,176,.1)'  },
    { key: 'livre',         label: '✅ Livré',                     color: '#4ADE80', bg: 'rgba(74,222,128,.1)'  },
    { key: ['refuse','annule'], label: '❌ Refusé / Annulé',       color: '#f87171', bg: 'rgba(248,113,113,.1)' },
  ];

  const getSection = (status) => {
    if (['refuse','annule'].includes(status)) return SECTIONS[4];
    return SECTIONS.find(s => s.key === status) || SECTIONS[0];
  };

  const filteredBy = (key) => {
    if (Array.isArray(key)) return quotes.filter(q => key.includes(q.status));
    return quotes.filter(q => q.status === key);
  };

  const inputStyle = (err) => ({
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,.04)',
    border: `1px solid ${err ? '#f87171' : 'rgba(201,168,76,.18)'}`,
    borderRadius: 10, color: 'var(--white)', fontSize: 13, outline: 'none',
  });

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, padding: '13px 26px', borderRadius: 12, background: toast.type === 'error' ? '#f87171' : '#4ADE80', color: '#000', fontWeight: 700, zIndex: 9999, fontSize: 14, boxShadow: '0 8px 30px rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {toast.type === 'error' ? <X size={16} /> : <CheckCircle size={16} />} {toast.msg}
        </div>
      )}
      

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Gestion</div>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 44, fontWeight: 700, color: 'var(--white)' }}>Mes Transits</h1>
          <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 6 }}>{quotes.length} demande{quotes.length > 1 ? 's' : ''} au total</div>
        </div>
        <button onClick={() => setShowForm(true)} style={{ padding: '13px 28px', background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', border: 'none', borderRadius: 12, color: 'var(--navy-deep)', fontWeight: 700, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={18} strokeWidth={2} /> Nouvelle Demande
        </button>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={{ width: '100%', maxWidth: 620, background: 'linear-gradient(160deg,#0A1628,#0D1F3C)', border: '1px solid rgba(201,168,76,.3)', borderRadius: 24, overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

            <div style={{ padding: '26px 32px', borderBottom: '1px solid rgba(201,168,76,.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(201,168,76,.04)' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>Nouvelle demande</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--white)', fontFamily: 'var(--ff-display)' }}>Soumettre un Transit</div>
              </div>
              <button onClick={() => { setShowForm(false); setFormErrors({}); }} style={{ width: 36, height: 36, border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, background: 'transparent', color: 'var(--gray)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
              {/* Service */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: formErrors.service ? '#f87171' : 'var(--gray)', display: 'block', marginBottom: 8 }}>Type de service *</label>
                <select value={form.service} onChange={e => setForm(p => ({ ...p, service: e.target.value }))}
                  style={{ ...inputStyle(formErrors.service), color: form.service ? 'var(--white)' : 'var(--dark-gray)' }}>
                  <option value="">Sélectionner un service</option>
                  {['Transport Maritime','Dédouanement','Manutention & Levage','Magasin Sous Douane','Transport Terrestre','Acconage Portuaire'].map(s => (
                    <option key={s} style={{ background: '#0D1F3C' }}>{s}</option>
                  ))}
                </select>
                {formErrors.service && <div style={{ fontSize: 11, color: '#f87171', marginTop: 5 }}>⚠ {formErrors.service}</div>}
              </div>

              {/* Origin + Destination */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                {[
                  { key: 'origin',      label: "Port d'origine *",     placeholder: 'Ex: Marseille, France' },
                  { key: 'destination', label: 'Port de destination *', placeholder: 'Ex: Sousse, Tunisie'   },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 12, color: formErrors[f.key] ? '#f87171' : 'var(--gray)', display: 'block', marginBottom: 8 }}>{f.label}</label>
                    <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder} style={inputStyle(formErrors[f.key])} />
                    {formErrors[f.key] && <div style={{ fontSize: 11, color: '#f87171', marginTop: 5 }}>⚠ {formErrors[f.key]}</div>}
                  </div>
                ))}
              </div>

              {/* Cargo + Weight */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                {[
                  { key: 'cargo',  label: 'Type de marchandise', placeholder: 'Ex: Matériel industriel' },
                  { key: 'weight', label: 'Poids (tonnes)',       placeholder: 'Ex: 15'                  },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 12, color: formErrors[f.key] ? '#f87171' : 'var(--gray)', display: 'block', marginBottom: 8 }}>{f.label}</label>
                    <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder} style={inputStyle(formErrors[f.key])} />
                    {formErrors[f.key] && <div style={{ fontSize: 11, color: '#f87171', marginTop: 5 }}>⚠ {formErrors[f.key]}</div>}
                  </div>
                ))}
              </div>

              {/* Deadline */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: formErrors.deadline ? '#f87171' : 'var(--gray)', display: 'block', marginBottom: 8 }}>Date limite souhaitée *</label>
                <input type="date" value={form.deadline}
                  onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  style={inputStyle(formErrors.deadline)} />
                {formErrors.deadline && <div style={{ fontSize: 11, color: '#f87171', marginTop: 5 }}>⚠ {formErrors.deadline}</div>}
              </div>

              {/* Notes */}
              <div>
                <label style={{ fontSize: 12, color: 'var(--gray)', display: 'block', marginBottom: 8 }}>Notes supplémentaires</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Informations complémentaires, contraintes particulières..." rows={3}
                  style={{ ...inputStyle(false), resize: 'vertical', fontFamily: 'var(--ff-body)' }} />
              </div>
            </div>

            <div style={{ padding: '18px 32px', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', gap: 12 }}>
              <button onClick={submitForm} disabled={formSending} style={{ flex: 1, padding: '13px', background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', border: 'none', borderRadius: 11, color: 'var(--navy-deep)', fontWeight: 700, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {formSending ? <><Loader2 size={16} className="spin" /> Envoi...</> : <><Send size={16} /> Soumettre la demande</>}
              </button>
              <button onClick={() => { setShowForm(false); setFormErrors({}); }} style={{ padding: '13px 22px', background: 'transparent', border: '1px solid rgba(255,255,255,.1)', borderRadius: 11, color: 'var(--gray)', cursor: 'pointer', fontSize: 13 }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailQuote && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setDetailQuote(null)}>
          <div style={{ width: '100%', maxWidth: 560, background: 'linear-gradient(160deg,#0A1628,#0D1F3C)', border: '1px solid rgba(201,168,76,.3)', borderRadius: 22, overflow: 'hidden' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(201,168,76,.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(201,168,76,.04)' }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>Détails du transit</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--white)' }}>{detailQuote.service}</div>
              </div>
              <button onClick={() => setDetailQuote(null)} style={{ width: 34, height: 34, border: '1px solid rgba(255,255,255,.1)', borderRadius: 9, background: 'transparent', color: 'var(--gray)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Service',         value: detailQuote.service },
                { label: 'Statut',          value: getSection(detailQuote.status).label },
                { label: "Port d'origine",  value: detailQuote.origin },
                { label: 'Destination',     value: detailQuote.destination },
                { label: 'Marchandise',     value: detailQuote.cargo   || '—' },
                { label: 'Poids',           value: detailQuote.weight  ? `${detailQuote.weight} t` : '—' },
                { label: 'Date limite',     value: detailQuote.deadline || '—' },
                { label: 'Soumis le',       value: new Date(detailQuote.createdAt).toLocaleDateString('fr-FR') },
                ...(detailQuote.devisAmount ? [{ label: 'Montant proposé', value: `${detailQuote.devisAmount} $` }] : []),
                ...(detailQuote.adminNote   ? [{ label: 'Note admin',      value: detailQuote.adminNote }] : []),
                ...(detailQuote.progress    ? [{ label: 'Progression',     value: `${detailQuote.progress}%` }] : []),
              ].map((f, i) => (
                <div key={i} style={{ padding: '10px 14px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10 }}>
                  <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--white)', fontWeight: 500 }}>{f.value}</div>
                </div>
              ))}
              {detailQuote.notes && (
                <div style={{ gridColumn: '1 / -1', padding: '10px 14px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10 }}>
                  <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Notes</div>
                  <div style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.6 }}>{detailQuote.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5 SECTIONS */}
      {loading ? (
        <div style={{ color: 'var(--gray)', padding: 40, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Loader2 size={18} className="spin" /> Chargement...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {SECTIONS.map((section, si) => {
            const items = filteredBy(section.key);
            return (
              <div key={si}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${section.color}40, transparent)` }} />
                  <div style={{ padding: '6px 18px', background: section.bg, border: `1px solid ${section.color}30`, borderRadius: 20, fontSize: 13, fontWeight: 700, color: section.color, whiteSpace: 'nowrap' }}>
                    {section.label} ({items.length})
                  </div>
                  <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, transparent, ${section.color}40)` }} />
                </div>

                {items.length === 0 ? (
                  <div style={{ padding: '18px 24px', background: 'rgba(13,31,60,.3)', border: '1px dashed rgba(255,255,255,.08)', borderRadius: 14, textAlign: 'center', fontSize: 13, color: 'var(--dark-gray)' }}>
                    Aucun transit dans cette section
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {items.map(q => (
                      <div key={q._id} style={{ padding: '16px 20px', background: 'rgba(13,31,60,.5)', border: `1px solid ${section.color}20`, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 16, transition: 'all .2s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = `${section.color}45`}
                        onMouseLeave={e => e.currentTarget.style.borderColor = `${section.color}20`}>

                        {/* Info */}
                        <div style={{ flex: 1, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', paddingRight: 16 }}>
                          <div style={{ minWidth: 200 }}>
                            <div style={{ fontSize: 11, color: section.color, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{q.service}</div>
                            <div style={{ fontSize: 15, color: 'var(--white)', fontWeight: 700, marginBottom: 3 }}>{q.origin?.split(',')[0]} → {q.destination?.split(',')[0]}</div>
                            <div style={{ fontSize: 11, color: 'var(--dark-gray)' }}>{q.userEmail}</div>
                          </div>

                          {/* Société */}
                          {q.userCompany && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '6px 12px', background: 'rgba(255,255,255,.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,.06)' }}>
                              <span style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>Société</span>
                              <span style={{ fontSize: 12, color: 'var(--white)' }}>{q.userCompany}</span>
                            </div>
                          )}

                          {/* Client */}
                          {q.userName && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '6px 12px', background: 'rgba(255,255,255,.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,.06)' }}>
                              <span style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>Client</span>
                              <span style={{ fontSize: 12, color: 'var(--white)', display: 'flex', alignItems: 'center', gap: 4 }}><User size={11} /> {q.userName}</span>
                            </div>
                          )}

                          {/* Marchandise */}
                          {q.cargo && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '6px 12px', background: 'rgba(255,255,255,.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,.06)' }}>
                              <span style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>Marchandise</span>
                              <span style={{ fontSize: 12, color: 'var(--white)', display: 'flex', alignItems: 'center', gap: 4 }}><Package size={11} /> {q.cargo}</span>
                            </div>
                          )}

                          {/* Poids */}
                          {q.weight && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '6px 12px', background: 'rgba(255,255,255,.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,.06)' }}>
                              <span style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>Poids</span>
                              <span style={{ fontSize: 12, color: 'var(--white)', display: 'flex', alignItems: 'center', gap: 4 }}><Scale size={11} /> {q.weight} t</span>
                            </div>
                          )}

                          {/* Date limite */}
                          {q.deadline && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '6px 12px', background: new Date(q.deadline) < new Date() ? 'rgba(248,113,113,.08)' : 'rgba(255,255,255,.04)', borderRadius: 10, border: `1px solid ${new Date(q.deadline) < new Date() ? 'rgba(248,113,113,.2)' : 'rgba(255,255,255,.06)'}` }}>
                              <span style={{ fontSize: 9, color: new Date(q.deadline) < new Date() ? '#f87171' : 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>
                                Date limite {new Date(q.deadline) < new Date() ? '⚠' : ''}
                              </span>
                              <span style={{ fontSize: 12, color: new Date(q.deadline) < new Date() ? '#f87171' : 'var(--white)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Calendar size={11} /> {q.deadline}
                              </span>
                            </div>
                          )}

                          {/* Devis */}
                          {q.devisAmount && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '6px 12px', background: 'rgba(201,168,76,.08)', borderRadius: 10, border: '1px solid rgba(201,168,76,.25)' }}>
                              <span style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>Devis proposé</span>
                              <span style={{ fontSize: 14, color: 'var(--gold)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <DollarSign size={13} strokeWidth={2} /> {q.devisAmount}
                              </span>
                            </div>
                          )}

                          {/* Progression */}
                          {['en_cours','livre'].includes(q.status) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
                              <span style={{ fontSize: 9, color: section.color, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>Progression</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${q.progress}%`, background: `linear-gradient(90deg,${section.color},${section.color}aa)`, borderRadius: 3, transition: 'width 1s ease' }} />
                                </div>
                                <span style={{ fontSize: 12, color: section.color, fontWeight: 700, flexShrink: 0 }}>{q.progress}%</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          {q.status === 'soumis' && (
                            <button onClick={() => cancelQuote(q._id)} style={{ padding: '7px 14px', background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.2)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                              <X size={12} /> Annuler
                            </button>
                          )}
                          {q.status === 'devis_propose' && (
                            <>
                              <button onClick={() => confirmQuote(q._id)} style={{ padding: '7px 14px', background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.3)', borderRadius: 8, color: '#4ADE80', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <CheckCircle size={12} /> Valider
                              </button>
                              <button onClick={() => cancelQuote(q._id)} style={{ padding: '7px 14px', background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.2)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <X size={12} /> Décliner
                              </button>
                            </>
                          )}
                          {/* Eye */}
                          <button onClick={() => setDetailQuote(q)} style={{ width: 34, height: 34, border: '1px solid rgba(201,168,76,.2)', borderRadius: 9, background: 'rgba(201,168,76,.05)', color: 'var(--gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,.15)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,168,76,.05)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,.2)'; }}>
                            <Eye size={15} strokeWidth={1.5} />
                          </button>
                        </div>
</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
// ── MAIN CLIENT DASHBOARD ─────────────────────────────────────────────────────
export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [tab, setTab]         = useState('overview');
  const [ships, setShips]     = useState([]);
  const [notifs, setNotifs]   = useState([]);
  const [thread, setThread]   = useState([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);
  const [msgSending, setMsgSending] = useState(false);
  const [msgSubject, setMsgSubject] = useState('Question générale');
  const [newMsg, setNewMsg]   = useState('');

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    company: user?.company || '', newPassword: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    loadShipments();
    loadNotifications();
  }, [user]);

  useEffect(() => {
    if (tab === 'shipments')     loadShipments();
    if (tab === 'notifications') loadNotifications();
    if (tab === 'messages')      loadThread();
    if (tab === 'overview')      { loadShipments(); loadNotifications(); }
  }, [tab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadShipments     = async () => { setLoading(true); try { const { data } = await api.get('/shipments');            setShips(data.shipments);  } catch {} setLoading(false); };
  const loadNotifications = async () => { try { const { data } = await api.get('/notifications'); setNotifs(data.notifications); setUnreadNotifs(data.unread); } catch {} };
  const loadThread        = async () => { setLoading(true); try { const { data } = await api.get('/direct-messages/mine'); setThread(data.messages);  } catch {} setLoading(false); };

  const saveProfile = async () => {
    setProfileSaving(true);
    try { await api.patch('/auth/profile', profileForm); showToast('Profil mis à jour !'); }
    catch (err) { showToast(err.response?.data?.message || 'Erreur', 'error'); }
    setProfileSaving(false);
  };

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    setMsgSending(true);
    try {
      await api.post('/direct-messages/mine', { content: newMsg, subject: msgSubject });
      setNewMsg('');
      await loadThread();
    } catch { showToast('Erreur envoi', 'error'); }
    setMsgSending(false);
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotifs(0);
    } catch {}
  };

  const TABS = [
    { id: 'overview',      icon: <Home size={16} strokeWidth={1.5} />,          label: 'Accueil' },
    { id: 'shipments',     icon: <Ship size={16} strokeWidth={1.5} />,          label: 'Expéditions' },
    { id: 'transit',       icon: <FileEdit size={16} strokeWidth={1.5} />,      label: 'Mes Transits' },
    { id: 'messages',      icon: <MessageCircle size={16} strokeWidth={1.5} />, label: 'Messagerie' },
    { id: 'notifications', icon: <Bell size={16} strokeWidth={1.5} />,          label: 'Notifications' },
    { id: 'documents',     icon: <FileText size={16} strokeWidth={1.5} />,      label: 'Documents' },
    { id: 'ai-assistant',  icon: <Bot size={16} strokeWidth={1.5} />,           label: 'Assistant IA' },
    { id: 'profile',       icon: <User size={16} strokeWidth={1.5} />,          label: 'Mon Profil' },
  ];

  const card  = (extra = {}) => ({ padding: 24, background: 'rgba(13,31,60,.5)', border: '1px solid var(--border-gold)', borderRadius: 18, ...extra });
  const badge = (color, bg)   => ({ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: bg, color, fontWeight: 700 });

  const DOCS_INFO = [
    { icon: <ClipboardList size={36} strokeWidth={1.5} color="var(--gold)" />, name: 'Facture Commerciale',  desc: 'Document de base pour vos exportations.' },
    { icon: <Ship size={36} strokeWidth={1.5} color="var(--gold)" />,          name: 'Connaissement (B/L)', desc: 'Document négociable du transport maritime.' },
    { icon: <Globe size={36} strokeWidth={1.5} color="var(--gold)" />,         name: "Certificat d'Origine", desc: 'Pour les accords préférentiels UE-Tunisie.' },
    { icon: <CheckCircle size={36} strokeWidth={1.5} color="var(--gold)" />,   name: 'DAE',                 desc: "Autorisation d'enlèvement après dédouanement." },
    { icon: <Monitor size={36} strokeWidth={1.5} color="var(--gold)" />,       name: 'Guide SINDA',         desc: 'Procédures douanières tunisiennes.' },
    { icon: <FileText size={36} strokeWidth={1.5} color="var(--gold)" />,      name: 'DDM',                 desc: 'Déclaration en Détail des Marchandises.' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--navy-deep)', fontFamily: 'var(--ff-body)' }}>

      {/* Sidebar */}
      <aside style={{ width: 270, background: 'linear-gradient(180deg,#06101f 0%,#0A1628 60%,#0D1F3C 100%)', borderRight: '1px solid var(--border-gold)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-gold)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Anchor size={18} strokeWidth={2} color="var(--navy-deep)" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--ff-display)', fontSize: 13, fontWeight: 700, color: 'var(--white)', letterSpacing: 1.5 }}>GROUPE BAHRIA</div>
              <div style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase' }}>Espace Client</div>
            </div>
          </div>
          <div style={{ padding: '14px 16px', background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.15)', borderRadius: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--navy-deep)', flexShrink: 0 }}>
                {user?.firstName?.[0]?.toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.firstName} {user?.lastName}</div>
                {user?.company && <div style={{ fontSize: 11, color: 'var(--teal)', marginTop: 2 }}>{user.company}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} />
                  <span style={{ fontSize: 10, color: 'var(--gray)' }}>En ligne</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 11, width: '100%',
              padding: '10px 14px', marginBottom: 3, border: 'none', borderRadius: 10,
              background: tab === t.id ? 'linear-gradient(135deg,var(--gold),var(--gold-light))' : 'transparent',
              color: tab === t.id ? 'var(--navy-deep)' : 'var(--gray)',
              cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
              transition: 'all .2s', textAlign: 'left',
            }}>
              <IC>{t.icon}</IC>
              <span style={{ flex: 1 }}>{t.label}</span>
              {t.id === 'notifications' && unreadNotifs > 0 && (
                <span style={{ minWidth: 20, height: 20, borderRadius: 10, background: '#f87171', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{unreadNotifs}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: '14px 10px', borderTop: '1px solid var(--border-gold)' }}>
          <button onClick={() => navigate('/')} style={{ width: '100%', padding: '9px', background: 'transparent', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, color: 'var(--gray)', cursor: 'pointer', fontSize: 12, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <ArrowLeft size={14} strokeWidth={1.5} /> Retour au site
          </button>
          <button onClick={() => { logout(); navigate('/'); }} style={{ width: '100%', padding: '9px', background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.2)', borderRadius: 10, color: '#f87171', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <LogOut size={14} strokeWidth={1.5} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 270, flex: 1, padding: '36px 44px', minHeight: '100vh' }}>

        {toast && (
          <div style={{ position: 'fixed', top: 24, right: 24, padding: '13px 26px', borderRadius: 12, background: toast.type === 'error' ? '#f87171' : '#4ADE80', color: '#000', fontWeight: 700, zIndex: 9999, fontSize: 14, boxShadow: '0 8px 30px rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {toast.type === 'error' ? <X size={16} /> : <CheckCircle size={16} />} {toast.msg}
          </div>
        )}

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Bienvenue</div>
              <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 44, fontWeight: 700, color: 'var(--white)', lineHeight: 1.1 }}>Bonjour, {user?.firstName} !</h1>
              <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 8 }}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 36 }}>
              {[
                { icon: <Ship size={28} strokeWidth={1.5} color="var(--teal)" />,       label: 'Expéditions actives', value: ships.filter(s => s.status !== 'Livré').length, sub: `${ships.length} total`, color: 'var(--teal)', tabId: 'shipments' },
                { icon: <FileEdit size={28} strokeWidth={1.5} color="var(--gold)" />,   label: 'Mes Transits',        value: 0, sub: 'demandes',    color: 'var(--gold)', tabId: 'transit' },
                { icon: <Bell size={28} strokeWidth={1.5} color="#f87171" />,           label: 'Notifications',       value: unreadNotifs, sub: 'non lues', color: '#f87171', tabId: 'notifications' },
                { icon: <Package size={28} strokeWidth={1.5} color="#4ADE80" />,        label: 'Livraisons',          value: ships.filter(s => s.status === 'Livré').length, sub: 'complétées', color: '#4ADE80', tabId: 'shipments' },
              ].map((k, i) => (
                <div key={i} onClick={() => setTab(k.tabId)} style={{ ...card(), cursor: 'pointer', transition: 'all .25s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border-gold)'; }}>
                  <div style={{ marginBottom: 12 }}>{k.icon}</div>
                  <div style={{ fontFamily: 'var(--ff-display)', fontSize: 44, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.value}</div>
                  <div style={{ fontSize: 13, color: 'var(--white)', marginTop: 6, fontWeight: 600 }}>{k.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--dark-gray)', marginTop: 3 }}>{k.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 24 }}>
              <div style={card()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700 }}>Expéditions récentes</div>
                  <button onClick={() => setTab('shipments')} style={{ fontSize: 12, color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer' }}>Voir tout →</button>
                </div>
                {ships.slice(0, 3).map((s, i) => {
                  const sc = STATUS_COLORS[s.status] || STATUS_COLORS['En attente'];
                  return (
                    <div key={s._id} style={{ padding: '14px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>{s._id?.toString().slice(-8).toUpperCase()}</div>
                        <span style={badge(sc.color, sc.bg)}>{s.status}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--white)', marginBottom: 6 }}>{s.origin?.split(',')[0]} → {s.destination?.split(',')[0]}</div>
                      <div style={{ height: 5, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${s.progress}%`, background: sc.color, borderRadius: 3 }} />
                      </div>
                    </div>
                  );
                })}
                {ships.length === 0 && <div style={{ textAlign: 'center', padding: 30, color: 'var(--dark-gray)' }}>Aucune expédition</div>}
              </div>

              <div style={card()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700 }}>Notifications</div>
                  <button onClick={() => setTab('notifications')} style={{ fontSize: 12, color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer' }}>Tout voir →</button>
                </div>
                {notifs.slice(0, 4).map((n, i) => (
                  <div key={n._id || i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,.04)' : 'none', opacity: n.read ? .6 : 1 }}>
                    <div style={{ flexShrink: 0, marginTop: 1 }}>
                      {n.type === 'success' ? <CheckCircle size={16} strokeWidth={1.5} color="#4ADE80" /> : n.type === 'warning' ? <Bell size={16} strokeWidth={1.5} color="var(--gold)" /> : <Package size={16} strokeWidth={1.5} color="var(--teal)" />}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: n.read ? 400 : 700, color: 'var(--white)' }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 2 }}>{n.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[
                { icon: <FileEdit size={28} strokeWidth={1.5} color="var(--gold)" />,      label: 'Nouvelle demande',   sub: 'Soumettre un transit', tabId: 'transit',   color: 'var(--gold)' },
                { icon: <MessageCircle size={28} strokeWidth={1.5} color="var(--teal)" />, label: "Contacter l'équipe", sub: 'Messagerie directe',   tabId: 'messages',  color: 'var(--teal)' },
                { icon: <FileText size={28} strokeWidth={1.5} color="#7B5EA7" />,          label: 'Mes documents',      sub: 'Guides et formulaires', tabId: 'documents', color: '#7B5EA7'      },
              ].map((a, i) => (
                <button key={i} onClick={() => setTab(a.tabId)} style={{ ...card({ padding: '20px 22px', cursor: 'pointer', transition: 'all .25s', textAlign: 'left', background: 'rgba(13,31,60,.4)' }) }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'rgba(13,31,60,.8)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'rgba(13,31,60,.4)'; }}>
                  <div style={{ marginBottom: 10 }}>{a.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: a.color, marginBottom: 4 }}>{a.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--dark-gray)' }}>{a.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SHIPMENTS */}
        {tab === 'shipments' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Suivi en temps réel</div>
              <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 44, fontWeight: 700, color: 'var(--white)' }}>Mes Expéditions</h1>
            </div>
            {loading ? <div style={{ color: 'var(--gray)', padding: 40, display: 'flex', alignItems: 'center', gap: 10 }}><Loader2 size={18} className="spin" /> Chargement...</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {ships.map(s => {
                  const sc = STATUS_COLORS[s.status] || STATUS_COLORS['En attente'];
                  return (
                    <div key={s._id} style={card()}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div>
                          <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>{s._id?.toString().slice(-8).toUpperCase()}</div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--white)', marginBottom: 10 }}>{s.origin} → {s.destination}</div>
                          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                            {s.cargo && <span style={{ fontSize: 13, color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: 5 }}><Package size={13} /> {s.cargo}</span>}
                            {s.eta   && <span style={{ fontSize: 13, color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={13} /> ETA: {s.eta}</span>}
                          </div>
                        </div>
                        <span style={{ ...badge(sc.color, sc.bg), fontSize: 13, padding: '6px 18px' }}>{s.status}</span>
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--dark-gray)', marginBottom: 8 }}>
                          <span>Progression</span><span style={{ color: sc.color, fontWeight: 700 }}>{s.progress}%</span>
                        </div>
                        <div style={{ height: 10, background: 'rgba(255,255,255,.06)', borderRadius: 5, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${s.progress}%`, background: `linear-gradient(90deg,${sc.color},${sc.color}aa)`, borderRadius: 5, transition: 'width 1.5s ease' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {['Chargement','En mer',"Port d'arrivée",'Dédouanement','Livraison','Livré'].map((step, idx) => {
                          const done = s.progress >= (idx + 1) * 16;
                          return (
                            <div key={step} style={{ padding: '4px 12px', borderRadius: 20, background: done ? `${sc.color}22` : 'rgba(255,255,255,.03)', color: done ? sc.color : 'var(--dark-gray)', fontSize: 11, border: `1px solid ${done ? sc.color + '44' : 'transparent'}`, fontWeight: done ? 600 : 400 }}>
                              {done ? '✓ ' : ''}{step}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {ships.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 80, color: 'var(--gray)' }}>
                    <Ship size={48} strokeWidth={1} color="var(--gray)" style={{ margin: '0 auto 16px' }} />
                    <div>Aucune expédition en cours.</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TRANSIT */}
        {tab === 'transit' && <TransitSection />}

        {/* MESSAGES */}
        {tab === 'messages' && (
          <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Support</div>
              <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 44, fontWeight: 700, color: 'var(--white)' }}>Messagerie</h1>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              {['Question générale','Suivi expédition','Problème douanier','Demande documents','Urgence'].map(s => (
                <button key={s} onClick={() => setMsgSubject(s)} style={{ padding: '6px 16px', borderRadius: 20, border: '1px solid', borderColor: msgSubject === s ? 'var(--gold)' : 'rgba(255,255,255,.1)', background: msgSubject === s ? 'rgba(201,168,76,.15)' : 'transparent', color: msgSubject === s ? 'var(--gold)' : 'var(--gray)', cursor: 'pointer', fontSize: 12, fontWeight: msgSubject === s ? 700 : 400 }}>
                  {s}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: 'rgba(7,14,28,.6)', border: '1px solid var(--border-gold)', borderRadius: '18px 18px 0 0', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 300 }}>
              {thread.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: 60 }}>
                  <MessageCircle size={48} strokeWidth={1} color="var(--gray)" style={{ margin: '0 auto 16px' }} />
                  <div style={{ color: 'var(--gray)', fontSize: 15 }}>Commencez une conversation avec notre équipe.</div>
                  <div style={{ color: 'var(--dark-gray)', fontSize: 13, marginTop: 8 }}>Réponse garantie sous 2h en horaires ouvrés.</div>
                </div>
              )}
              {thread.map(m => {
                const isClient = m.from === 'client';
                return (
                  <div key={m._id} style={{ display: 'flex', flexDirection: isClient ? 'row-reverse' : 'row', gap: 12, alignItems: 'flex-end' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: isClient ? 'linear-gradient(135deg,var(--gold),var(--gold-light))' : 'linear-gradient(135deg,var(--teal),#0891B2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: isClient ? 'var(--navy-deep)' : 'white', flexShrink: 0 }}>
                      {isClient ? user?.firstName?.[0]?.toUpperCase() : <Anchor size={16} strokeWidth={2} />}
                    </div>
                    <div style={{ maxWidth: '70%' }}>
                      <div style={{ fontSize: 11, color: 'var(--dark-gray)', marginBottom: 4, textAlign: isClient ? 'right' : 'left' }}>
                        {isClient ? 'Vous' : 'Équipe Bahria'} · {new Date(m.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ padding: '12px 16px', borderRadius: isClient ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isClient ? 'linear-gradient(135deg,var(--gold),var(--gold-light))' : 'rgba(13,31,60,.85)', border: isClient ? 'none' : '1px solid rgba(201,168,76,.1)', color: isClient ? 'var(--navy-deep)' : 'var(--white)', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-line', fontWeight: isClient ? 500 : 400 }}>
                        {m.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ padding: '16px 20px', background: 'rgba(13,31,60,.7)', border: '1px solid var(--border-gold)', borderTop: 'none', borderRadius: '0 0 18px 18px', display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <textarea value={newMsg} onChange={e => setNewMsg(e.target.value)}
                placeholder="Votre message... (Entrée pour envoyer)" rows={2}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                style={{ flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.18)', borderRadius: 12, color: 'var(--white)', fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'var(--ff-body)' }} />
              <button onClick={sendMessage} disabled={msgSending || !newMsg.trim()}
                style={{ padding: '12px 20px', background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', border: 'none', borderRadius: 12, color: 'var(--navy-deep)', cursor: 'pointer', opacity: !newMsg.trim() ? .4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={20} strokeWidth={2} />
              </button>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {tab === 'notifications' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Alertes</div>
                <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 44, fontWeight: 700, color: 'var(--white)' }}>Notifications</h1>
              </div>
              {unreadNotifs > 0 && (
                <button onClick={markAllRead} style={{ padding: '10px 22px', background: 'transparent', border: '1px solid rgba(201,168,76,.3)', borderRadius: 10, color: 'var(--gold)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <CheckCircle size={14} strokeWidth={2} /> Tout marquer comme lu
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {notifs.map((n, i) => {
                const ts = {
                  success: { icon: <CheckCircle size={24} strokeWidth={1.5} color="#4ADE80" />, color: '#4ADE80', bg: 'rgba(74,222,128,.08)' },
                  info:    { icon: <Package size={24} strokeWidth={1.5} color="var(--teal)" />, color: 'var(--teal)', bg: 'rgba(11,180,176,.06)' },
                  warning: { icon: <Bell size={24} strokeWidth={1.5} color="var(--gold)" />,    color: 'var(--gold)', bg: 'rgba(201,168,76,.06)' },
                }[n.type] || { icon: <Bell size={24} strokeWidth={1.5} color="var(--gray)" />, color: 'var(--gray)', bg: 'rgba(255,255,255,.03)' };
                return (
                  <div key={n._id || i} style={{ display: 'flex', gap: 16, padding: '18px 22px', background: ts.bg, border: `1px solid ${n.read ? 'var(--border-gold)' : ts.color + '33'}`, borderRadius: 14, opacity: n.read ? .7 : 1 }}>
                    <div style={{ flexShrink: 0 }}>{ts.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ fontSize: 14, fontWeight: n.read ? 500 : 700, color: 'var(--white)' }}>{n.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--dark-gray)' }}>{new Date(n.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--gray)' }}>{n.message}</div>
                    </div>
                    {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: ts.color, flexShrink: 0, marginTop: 6 }} />}
                  </div>
                );
              })}
              {notifs.length === 0 && (
                <div style={{ textAlign: 'center', padding: 80, color: 'var(--gray)' }}>
                  <Bell size={48} strokeWidth={1} color="var(--gray)" style={{ margin: '0 auto 16px' }} />
                  Aucune notification.
                </div>
              )}
            </div>
          </div>
        )}

        {/* DOCUMENTS */}
        {tab === 'documents' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Ressources</div>
              <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 44, fontWeight: 700, color: 'var(--white)' }}>Documents utiles</h1>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 28 }}>
              {DOCS_INFO.map((d, i) => (
                <div key={i} style={{ ...card(), cursor: 'pointer', transition: 'all .25s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border-gold)'; }}>
                  <div style={{ marginBottom: 16 }}>{d.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--white)', marginBottom: 8 }}>{d.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.6, marginBottom: 16 }}>{d.desc}</div>
                  <button onClick={() => setTab('messages')} style={{ padding: '7px 16px', background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.25)', borderRadius: 8, color: 'var(--gold)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                    Demander →
                  </button>
                </div>
              ))}
            </div>
            <div style={{ padding: '22px 28px', background: 'rgba(11,180,176,.06)', border: '1px solid rgba(11,180,176,.15)', borderRadius: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 15, color: 'var(--white)', fontWeight: 600, marginBottom: 8 }}>Besoin d'un document spécifique ?</div>
              <div style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 12 }}>Notre équipe vous l'envoie sous 24h.</div>
              <div style={{ fontSize: 14, color: 'var(--teal)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={14} strokeWidth={1.5} /> +216 73 322 518</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={14} strokeWidth={1.5} /> commercial@smcbahria.com</span>
              </div>
            </div>
          </div>
        )}

        {/* AI ASSISTANT */}
        {tab === 'ai-assistant' && <AIAssistant />}

        {/* PROFILE */}
        {tab === 'profile' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Paramètres</div>
              <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 44, fontWeight: 700, color: 'var(--white)' }}>Mon Profil</h1>
            </div>
            <div style={{ maxWidth: 600, ...card() }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, padding: '20px', background: 'rgba(201,168,76,.04)', borderRadius: 14, border: '1px solid rgba(201,168,76,.1)' }}>
                <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700, color: 'var(--navy-deep)', flexShrink: 0 }}>
                  {user?.firstName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--white)' }}>{user?.firstName} {user?.lastName}</div>
                  <div style={{ fontSize: 13, color: 'var(--teal)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={13} strokeWidth={1.5} /> {user?.email}</div>
                  {user?.company && <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 2 }}>{user.company}</div>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {[{ key: 'firstName', label: 'Prénom' }, { key: 'lastName', label: 'Nom' }].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 12, color: 'var(--gray)', display: 'block', marginBottom: 8 }}>{f.label}</label>
                    <input value={profileForm[f.key]} onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: '100%', padding: '13px 16px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.18)', borderRadius: 10, color: 'var(--white)', fontSize: 14, outline: 'none' }} />
                  </div>
                ))}
              </div>
              {[
                { key: 'company',     label: 'Société',  placeholder: 'Nom de votre entreprise', type: 'text' },
                { key: 'newPassword', label: 'Nouveau mot de passe', placeholder: '••••••••', type: 'password' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: 'var(--gray)', display: 'block', marginBottom: 8 }}>{f.label}</label>
                  <input type={f.type} value={profileForm[f.key]} onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: '100%', padding: '13px 16px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.18)', borderRadius: 10, color: 'var(--white)', fontSize: 14, outline: 'none' }} />
                </div>
              ))}
              <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,.03)', borderRadius: 10, marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: 'var(--gold)', marginBottom: 4 }}>EMAIL (non modifiable)</div>
                <div style={{ fontSize: 14, color: 'var(--gray)' }}>{user?.email}</div>
              </div>
              <button onClick={saveProfile} disabled={profileSaving}
                style={{ width: '100%', padding: 16, background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', border: 'none', borderRadius: 11, color: 'var(--navy-deep)', fontWeight: 700, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {profileSaving ? <><Loader2 size={18} className="spin" /> Sauvegarde...</> : <>Sauvegarder les modifications →</>}
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
} 
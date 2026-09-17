import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  LayoutDashboard, Users, Mail, MessageCircle, Ship, DollarSign,
  Calendar, Package, MapPin, X, Eye, CheckCircle, Send, Loader2,
  ArrowLeft, LogOut, User,Scale, Anchor
} from 'lucide-react';
import AdminCalendar from '../components/AdminCalendar';


const STATUS_COLORS = {
  'En transit':   { color: '#0BB4B0', bg: 'rgba(11,180,176,.15)' },
  'Dédouanement': { color: '#C9A84C', bg: 'rgba(201,168,76,.15)' },
  'En attente':   { color: '#8899AA', bg: 'rgba(136,153,170,.15)' },
  'Livré':        { color: '#4ADE80', bg: 'rgba(74,222,128,.15)' },
};

// Composant utilitaire pour centrer facilement les icônes
const IC = ({ children, size = 16 }) => (
  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, flexShrink: 0 }}>
    {children}
  </span>
);
function TransitsAdminSection({ quotes, loading, loadQuotes, showToast }) {
  const [detailQuote, setDetailQuote] = useState(null);
  const [devisAmount, setDevisAmount] = useState('');
  const [refusReason, setRefusReason] = useState('');
  const [showRefusInput, setShowRefusInput] = useState(false);
  const [sending, setSending] = useState(false);

  const SECTIONS = [
    { key: 'soumis',        label: '🕐 Nouvelles Demandes',        color: '#8899AA', bg: 'rgba(136,153,170,.1)'  },
    { key: 'devis_propose', label: '💰 En attente de confirmation', color: '#C9A84C', bg: 'rgba(201,168,76,.1)'  },
    { key: 'en_cours',      label: '🚢 En cours',                  color: '#0BB4B0', bg: 'rgba(11,180,176,.1)'  },
    { key: 'livre',         label: '✅ Livré',                     color: '#4ADE80', bg: 'rgba(74,222,128,.1)'  },
    { key: ['refuse','annule'], label: '❌ Refusé / Annulé',       color: '#f87171', bg: 'rgba(248,113,113,.1)' },
  ];

  const filteredBy = (key) => {
    if (Array.isArray(key)) return quotes.filter(q => key.includes(q.status));
    return quotes.filter(q => q.status === key);
  };

  const openDetail = (q) => {
    setDetailQuote(q);
    setDevisAmount('');
    setRefusReason('');
    setShowRefusInput(false);
  };

  const proposeDevis = async () => {
    if (!devisAmount || Number(devisAmount) <= 0) {
      showToast('Veuillez saisir un montant valide.', 'error'); return;
    }
    setSending(true);
    try {
      await api.patch(`/admin/quotes/${detailQuote._id}/propose`, { devisAmount: Number(devisAmount) });
      showToast('Devis proposé au client !');
      setDetailQuote(null);
      loadQuotes();
    } catch { showToast('Erreur', 'error'); }
    setSending(false);
  };

  const refuseTransit = async () => {
    if (!refusReason.trim()) {
      showToast('Veuillez indiquer la raison du refus.', 'error'); return;
    }
    setSending(true);
    try {
      await api.patch(`/admin/quotes/${detailQuote._id}/refuse`, { adminNote: refusReason });
      showToast('Transit refusé.');
      setDetailQuote(null);
      loadQuotes();
    } catch { showToast('Erreur', 'error'); }
    setSending(false);
  };

  const updateProgress = async (id, progress) => {
    try {
      await api.patch(`/admin/quotes/${id}/progress`, { progress });
      loadQuotes();
    } catch {}
  };

  const FIELD_LABELS = {
    service: 'Service', origin: "Port d'origine", destination: 'Destination',
    cargo: 'Marchandise', weight: 'Poids', deadline: 'Date limite',
    notes: 'Notes', devisAmount: 'Montant proposé', adminNote: 'Note admin',
    progress: 'Progression', userEmail: 'Client',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Logistique</div>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 40, fontWeight: 700, color: 'var(--white)' }}>Gestion des Transits</h1>
        <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 6 }}>{quotes.length} transit{quotes.length > 1 ? 's' : ''} au total</div>
      </div>

      {/* DETAIL MODAL */}
      {detailQuote && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(12px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setDetailQuote(null)}>
          <div style={{ width: '100%', maxWidth: 560, background: 'linear-gradient(160deg,#0A1628,#0D1F3C)', border: '1px solid rgba(201,168,76,.3)', borderRadius: 24, overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

            {/* Modal header */}
            <div style={{ padding: '22px 28px', borderBottom: '1px solid rgba(201,168,76,.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(201,168,76,.04)', flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>Détails du transit</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--white)' }}>{detailQuote.service}</div>
                <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 2 }}>{detailQuote.userEmail}</div>
              </div>
              <button onClick={() => setDetailQuote(null)} style={{ width: 34, height: 34, border: '1px solid rgba(255,255,255,.1)', borderRadius: 9, background: 'transparent', color: 'var(--gray)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={15} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {[
                  { label: "Port d'origine",  value: detailQuote.origin },
                  { label: 'Destination',     value: detailQuote.destination },
                  { label: 'Marchandise',     value: detailQuote.cargo   || '—' },
                  { label: 'Poids',           value: detailQuote.weight  ? `${detailQuote.weight} t` : '—' },
                  { label: 'Date limite',     value: detailQuote.deadline || '—' },
                  { label: 'Soumis le',       value: new Date(detailQuote.createdAt).toLocaleDateString('fr-FR') },
                  ...(detailQuote.devisAmount ? [{ label: 'Montant proposé', value: `${detailQuote.devisAmount} $` }] : []),
                  ...(detailQuote.progress > 0 ? [{ label: 'Progression', value: `${detailQuote.progress}%` }] : []),
                ].map((f, i) => (
                  <div key={i} style={{ padding: '10px 14px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10 }}>
                    <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--white)', fontWeight: 500 }}>{f.value}</div>
                  </div>
                ))}
                {detailQuote.notes && (
                  <div style={{ gridColumn: '1 / -1', padding: '10px 14px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10 }}>
                    <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Notes client</div>
                    <div style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.6 }}>{detailQuote.notes}</div>
                  </div>
                )}
                {detailQuote.adminNote && (
                  <div style={{ gridColumn: '1 / -1', padding: '10px 14px', background: 'rgba(248,113,113,.05)', border: '1px solid rgba(248,113,113,.15)', borderRadius: 10 }}>
                    <div style={{ fontSize: 10, color: '#f87171', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Raison du refus</div>
                    <div style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.6 }}>{detailQuote.adminNote}</div>
                  </div>
                )}
              </div>

              {/* ACTIONS — only for soumis */}
              {detailQuote.status === 'soumis' && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 20 }}>

                  {!showRefusInput ? (
                    <>
                      {/* Propose devis */}
                      <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 2 }}>
                        Proposer un devis
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <input
                            type="number"
                            value={devisAmount}
                            onChange={e => setDevisAmount(e.target.value)}
                            placeholder="Montant en $"
                            style={{ width: '100%', padding: '11px 40px 11px 14px', background: 'rgba(255,255,255,.04)', border: `1px solid ${devisAmount ? 'rgba(201,168,76,.4)' : 'rgba(201,168,76,.18)'}`, borderRadius: 10, color: 'var(--white)', fontSize: 14, outline: 'none' }}
                          />
                          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', fontSize: 14, fontWeight: 700 }}>$</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={proposeDevis} disabled={sending || !devisAmount}
                          style={{ flex: 1, padding: '12px', background: devisAmount ? 'linear-gradient(135deg,var(--gold),var(--gold-light))' : 'rgba(255,255,255,.05)', border: 'none', borderRadius: 10, color: devisAmount ? 'var(--navy-deep)' : 'var(--dark-gray)', fontWeight: 700, cursor: devisAmount ? 'pointer' : 'not-allowed', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                          {sending ? <><Loader2 size={16} className="spin" /> Envoi...</> : <><Send size={15} /> Envoyer le devis</>}
                        </button>
                        <button onClick={() => setShowRefusInput(true)}
                          style={{ padding: '12px 18px', background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.2)', borderRadius: 10, color: '#f87171', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <X size={14} /> Refuser
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Refus reason input */}
                      <div style={{ fontSize: 12, color: '#f87171', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 2 }}>
                        Raison du refus
                      </div>
                      <textarea
                        value={refusReason}
                        onChange={e => setRefusReason(e.target.value)}
                        placeholder="Expliquez la raison du refus au client..."
                        rows={4}
                        style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 10, color: 'var(--white)', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'var(--ff-body)', marginBottom: 12 }}
                      />
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={refuseTransit} disabled={sending || !refusReason.trim()}
                          style={{ flex: 1, padding: '12px', background: refusReason.trim() ? 'rgba(248,113,113,.15)' : 'rgba(255,255,255,.05)', border: `1px solid ${refusReason.trim() ? 'rgba(248,113,113,.4)' : 'transparent'}`, borderRadius: 10, color: refusReason.trim() ? '#f87171' : 'var(--dark-gray)', fontWeight: 700, cursor: refusReason.trim() ? 'pointer' : 'not-allowed', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                          {sending ? <><Loader2 size={16} className="spin" /> Envoi...</> : <><X size={15} /> Confirmer le refus</>}
                        </button>
                        <button onClick={() => { setShowRefusInput(false); setRefusReason(''); }}
                          style={{ padding: '12px 18px', background: 'transparent', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, color: 'var(--gray)', cursor: 'pointer', fontSize: 13 }}>
                          Retour
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Progress slider for en_cours */}
              {detailQuote.status === 'en_cours' && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 20 }}>
                  <div style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 2 }}>
                    Mettre à jour la progression
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <input type="range" min={1} max={99}
                      defaultValue={detailQuote.progress}
                      onChange={e => updateProgress(detailQuote._id, Number(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--gold)' }} />
                    <span style={{ fontSize: 14, color: 'var(--gold)', fontWeight: 700, minWidth: 40 }}>{detailQuote.progress}%</span>
                  </div>
                  <button onClick={() => { updateProgress(detailQuote._id, 100); setDetailQuote(null); }}
                    style={{ width: '100%', padding: '12px', background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.3)', borderRadius: 10, color: '#4ADE80', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <CheckCircle size={16} /> Marquer comme Livré (100%)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5 SECTIONS */}
      {loading ? (
        <div style={{ color: 'var(--gray)', padding: 40 }}>Chargement...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {SECTIONS.map((section, si) => {
            const items = filteredBy(section.key);
            return (
              <div key={si}>
                {/* Section header */}
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
                        {/* Info */}
                        <div style={{ flex: 1, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', paddingRight: 16 }}>
                          <div style={{ minWidth: 200 }}>
                            <div style={{ fontSize: 11, color: section.color, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{q.service}</div>
                            <div style={{ fontSize: 15, color: 'var(--white)', fontWeight: 700, marginBottom: 3 }}>{q.origin?.split(',')[0]} → {q.destination?.split(',')[0]}</div>
                            <div style={{ fontSize: 11, color: 'var(--dark-gray)' }}>{q.userEmail}</div>
                          </div>

                          {/* Société */}
                          {q.userName && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '6px 12px', background: 'rgba(255,255,255,.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,.06)' }}>
                              <span style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>Client</span>
                              <span style={{ fontSize: 12, color: 'var(--white)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <User size={11} /> {q.userName}
                              </span>
                            </div>
                          )}

                          {/* Société client */}
                          {q.userName && (
                            <span style={{ fontSize: 12, color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', background: 'rgba(255,255,255,.04)', borderRadius: 8 }}>
                              <User size={12} /> {q.userName}
                            </span>
                          )}

                          {/* Société */}
                          {q.userCompany && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '6px 12px', background: 'rgba(255,255,255,.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,.06)' }}>
                              <span style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>Société</span>
                              <span style={{ fontSize: 12, color: 'var(--white)' }}>{q.userCompany}</span>
                            </div>
                          )}

                          {/* Client nom */}
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
                                Date limite {new Date(q.deadline) < new Date() ? '⚠ Dépassée' : ''}
                              </span>
                              <span style={{ fontSize: 12, color: new Date(q.deadline) < new Date() ? '#f87171' : 'var(--white)', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={11} /> {q.deadline}</span>
                            </div>
                          )}

                          {/* Montant devis */}
                          {q.devisAmount && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '6px 12px', background: 'rgba(201,168,76,.08)', borderRadius: 10, border: '1px solid rgba(201,168,76,.25)' }}>
                              <span style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>Devis proposé</span>
                              <span style={{ fontSize: 14, color: 'var(--gold)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><DollarSign size={13} strokeWidth={2} /> {q.devisAmount}</span>
                            </div>
                          )}

                          {/* Progress bar */}
                          {['en_cours','livre'].includes(q.status) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
                              <span style={{ fontSize: 9, color: section.color, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>Progression</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${q.progress}%`, background: `linear-gradient(90deg,${section.color},${section.color}aa)`, borderRadius: 3, transition: 'width 1s ease' }} />
                                </div>
                                <span style={{ fontSize: 12, color: section.color, fontWeight: 700 }}>{q.progress}%</span>
                              </div>
                            </div>
                          )}
                          {/* Progress for en_cours/livre */}
                          {['en_cours','livre'].includes(q.status) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 140 }}>
                              <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${q.progress}%`, background: `linear-gradient(90deg,${section.color},${section.color}aa)`, borderRadius: 3, transition: 'width 1s ease' }} />
                              </div>
                              <span style={{ fontSize: 12, color: section.color, fontWeight: 700 }}>{q.progress}%</span>
                            </div>
                          )}
                        </div>

                        {/* Eye button */}
                        <button onClick={() => openDetail(q)} style={{ width: 36, height: 36, border: '1px solid rgba(201,168,76,.2)', borderRadius: 10, background: 'rgba(201,168,76,.05)', color: 'var(--gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', flexShrink: 0 }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,.15)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,168,76,.05)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,.2)'; }}>
                          <Eye size={16} strokeWidth={1.5} />
                        </button>
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
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [ships, setShips] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [directMsgs, setDirectMsgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [newShip, setNewShip] = useState({
    clientName: '', origin: '', destination: '',
    cargo: '', eta: '', status: 'En attente', userId: ''
  });
  const [showShipForm, setShowShipForm] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    loadStats();
    loadUsers();
  }, [user]);

  useEffect(() => {
    if (tab === 'stats')      loadStats();
    if (tab === 'users')      loadUsers();
    if (tab === 'messages')   loadMessages();
    if (tab === 'shipments')  loadShipments();
    if (tab === 'quotes')     loadQuotes();
    if (tab === 'direct')     loadDirectMessages();
  }, [tab]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  async function loadStats()    { try { const { data } = await api.get('/admin/stats');    setStats(data);          } catch {} }
  async function loadUsers()    { setLoading(true); try { const { data } = await api.get('/admin/users');    setUsers(data.users);    } catch {} setLoading(false); }
  async function loadMessages() { setLoading(true); try { const { data } = await api.get('/admin/messages'); setMsgs(data.messages);  } catch {} setLoading(false); }
  async function loadShipments(){ setLoading(true); try { const { data } = await api.get('/admin/shipments');setShips(data.shipments);} catch {} setLoading(false); }
  async function loadQuotes()   { setLoading(true); try { const { data } = await api.get('/admin/quotes');   setQuotes(data.quotes);  } catch {} setLoading(false); }
  async function loadDirectMessages() { setLoading(true); try { const { data } = await api.get('/direct-messages/all'); setDirectMsgs(data.messages); } catch {} setLoading(false); }
const proposeDevis = async (id, amount) => {
  try {
    await api.patch(`/admin/quotes/${id}/propose`, { devisAmount: amount });
    showToast('Devis proposé au client !');
    loadQuotes();
  } catch { showToast('Erreur', 'error'); }
};

const refuseQuote = async (id) => {
  try {
    await api.patch(`/admin/quotes/${id}/refuse`);
    showToast('Transit refusé.');
    loadQuotes();
  } catch { showToast('Erreur', 'error'); }
};

const updateProgress = async (id, progress) => {
  try {
    await api.patch(`/admin/quotes/${id}/progress`, { progress });
    loadQuotes();
  } catch {}
};
  async function toggleUser(id) {
    try {
      const { data } = await api.patch(`/admin/users/${id}/toggle`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, active: data.active } : u));
      showToast(data.message);
    } catch { showToast('Erreur', 'error'); }
  }

  async function deleteUser(id) {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      showToast('Utilisateur supprimé.');
    } catch { showToast('Erreur', 'error'); }
  }

  async function markRead(id) {
    try {
      await api.patch(`/admin/messages/${id}/read`);
      setMsgs(prev => prev.map(m => m._id === id ? { ...m, read: true } : m));
    } catch {}
  }

  async function createShipment() {
    if (!newShip.clientName || !newShip.origin || !newShip.destination) {
      showToast('Remplissez les champs obligatoires.', 'error'); return;
    }
    try {
      const { data } = await api.post('/admin/shipments', newShip);
      setShips(prev => [...prev, data.shipment]);
      setNewShip({ clientName: '', origin: '', destination: '', cargo: '', eta: '', status: 'En attente', userId: '' });
      setShowShipForm(false);
      showToast('Expédition créée.');
    } catch { showToast('Erreur', 'error'); }
  }

  async function deleteShipment(id) {
    if (!window.confirm('Supprimer cette expédition ?')) return;
    try {
      await api.delete(`/admin/shipments/${id}`);
      setShips(prev => prev.filter(s => s._id !== id));
      showToast('Expédition supprimée.');
    } catch { showToast('Erreur', 'error'); }
  }

  async function updateQuoteStatus(id, status) {
    try {
      const { data } = await api.patch(`/admin/quotes/${id}`, { status });
      setQuotes(prev => prev.map(q => q._id === id ? { ...q, status } : q));
      showToast(data.message);
    } catch { showToast('Erreur', 'error'); }
  }

  const TABS = [
    { id: 'stats',     icon: <LayoutDashboard size={18} />, label: 'Tableau de bord' },
    { id: 'users',     icon: <Users size={18} />,           label: 'Utilisateurs' },
    { id: 'messages',  icon: <Mail size={18} />,            label: 'Messages Contact' },
    { id: 'direct',    icon: <MessageCircle size={18} />,   label: 'Messagerie Clients' },
    { id: 'calendar',  icon: <Calendar size={18} strokeWidth={1.5} />, label: 'Calendrier' },
    { id: 'shipments', icon: <Ship size={18} />,            label: 'Expéditions' },
    { id: 'quotes', icon: <Ship size={18} strokeWidth={1.5} />, label: 'Transits' }, 
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--navy-deep)', fontFamily: 'var(--ff-body)' }}>

      {/* Sidebar */}
      <aside style={{ width: 260, background: 'rgba(13,31,60,.9)', borderRight: '1px solid var(--border-gold)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 }}>
        <div style={{ padding: '28px 24px', borderBottom: '1px solid var(--border-gold)' }}>
          <div style={{ fontFamily: 'var(--ff-display)', fontSize: 18, fontWeight: 700, color: 'var(--white)', letterSpacing: 2 }}>GROUPE BAHRIA</div>
          <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: 3, textTransform: 'uppercase', marginTop: 4 }}>Panel Administrateur</div>
        </div>

        <nav style={{ flex: 1, padding: '20px 12px' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px',
              background: tab === t.id ? 'linear-gradient(135deg,var(--gold),var(--gold-light))' : 'transparent',
              color: tab === t.id ? 'var(--navy-deep)' : 'var(--gray)', border: 'none', borderRadius: 10,
              cursor: 'pointer', fontSize: 14, fontWeight: tab === t.id ? 700 : 500, marginBottom: 4,
              transition: 'all .2s', textAlign: 'left',
            }}>
              <IC>{t.icon}</IC> {t.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px 16px', borderTop: '1px solid var(--border-gold)' }}>
  {/* User card */}
  <div style={{ padding: '12px 14px', background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.12)', borderRadius: 14, marginBottom: 10 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: 'var(--navy-deep)', flexShrink: 0 }}>
        {user?.firstName?.[0]?.toUpperCase()}
      </div>
      <div style={{ overflow: 'hidden' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user?.firstName} {user?.lastName}
        </div>
        <div style={{ fontSize: 10, color: 'var(--gold)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user?.email}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ADE80' }} />
          <span style={{ fontSize: 9, color: 'var(--gray)', letterSpacing: 1 }}>EN LIGNE</span>
        </div>
      </div>
    </div>
  </div>

  {/* Buttons */}
  <button onClick={() => navigate('/')} style={{ width: '100%', padding: '9px', background: 'transparent', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, color: 'var(--gray)', cursor: 'pointer', fontSize: 12, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all .2s' }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)'; e.currentTarget.style.color = 'var(--white)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = 'var(--gray)'; }}>
    <ArrowLeft size={13} strokeWidth={1.5} /> Retour au site
  </button>

  <button onClick={() => { logout(); navigate('/'); }} style={{ width: '100%', padding: '9px', background: 'rgba(248,113,113,.06)', border: '1px solid rgba(248,113,113,.15)', borderRadius: 10, color: '#f87171', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all .2s' }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,.12)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,.3)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,.06)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,.15)'; }}>
    <LogOut size={13} strokeWidth={1.5} /> Déconnexion
  </button>
</div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 260, flex: 1, padding: '32px 40px', minHeight: '100vh' }}>

        {/* Toast */}
        {toast && (
          <div style={{ position: 'fixed', top: 20, right: 20, padding: '12px 24px', borderRadius: 12, background: toast.type === 'error' ? '#f87171' : '#4ADE80', color: '#000', fontWeight: 700, zIndex: 9999, fontSize: 14 }}>
            {toast.msg}
          </div>
        )}

        {/* STATS */}
        {tab === 'stats' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Vue d'ensemble</div>
              <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 40, fontWeight: 700, color: 'var(--white)' }}>Tableau de bord</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 40 }}>
              {[
                { label: 'Utilisateurs', value: stats?.totalUsers ?? '—',      sub: `${stats?.activeUsers ?? 0} actifs`,    color: 'var(--teal)', icon: <Users size={32} color="var(--teal)" /> },
                { label: 'Messages',     value: stats?.totalMessages ?? '—',   sub: `${stats?.unreadMessages ?? 0} non lus`, color: 'var(--gold)', icon: <Mail size={32} color="var(--gold)" />  },
                { label: 'Expéditions',  value: stats?.totalShipments ?? '—',  sub: `${stats?.activeShipments ?? 0} actives`,color: '#7B5EA7',     icon: <Ship size={32} color="#7B5EA7" /> },
                { label: 'Devis',        value: stats?.totalQuotes ?? '—',     sub: `${stats?.pendingQuotes ?? 0} en attente`,color: '#E57C4A',    icon: <DollarSign size={32} color="#E57C4A" /> },
              ].map((s, i) => (
                <div key={i} style={{ padding: 24, background: 'rgba(13,31,60,.6)', border: '1px solid var(--border-gold)', borderRadius: 18 }}>
                  <div style={{ marginBottom: 12 }}>{s.icon}</div>
                  <div style={{ fontFamily: 'var(--ff-display)', fontSize: 46, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: 'var(--white)', marginTop: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 4 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(13,31,60,.5)', border: '1px solid var(--border-gold)', borderRadius: 18, padding: 28 }}>
              <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20 }}>Expéditions récentes</div>
              {ships.slice(0, 4).map((s, i) => {
                const sc = STATUS_COLORS[s.status] || STATUS_COLORS['En attente'];
                return (
                  <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)' }}>{s.clientName}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={10} /> {s.origin} → {s.destination}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: sc.bg, color: sc.color, fontWeight: 600 }}>{s.status}</span>
                  </div>
                );
              })}
              {ships.length === 0 && <div style={{ color: 'var(--gray)', textAlign: 'center', padding: 20 }}>Aucune expédition</div>}
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Gestion</div>
              <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 40, fontWeight: 700, color: 'var(--white)' }}>Utilisateurs</h1>
            </div>
            {loading ? <div style={{ color: 'var(--gray)' }}>Chargement...</div> : (
              <div style={{ background: 'rgba(13,31,60,.5)', border: '1px solid var(--border-gold)', borderRadius: 18, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(201,168,76,.06)' }}>
                      {['Nom', 'Email', 'Société', 'Statut', 'Inscrit le', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid var(--border-gold)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                        <td style={{ padding: '14px 20px', fontSize: 14, color: 'var(--white)' }}>{u.firstName} {u.lastName}</td>
                        <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--gray)' }}>{u.email}</td>
                        <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--gray)' }}>{u.company || '—'}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: u.active ? 'rgba(74,222,128,.15)' : 'rgba(248,113,113,.15)', color: u.active ? '#4ADE80' : '#f87171', fontWeight: 600 }}>
                            {u.active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 12, color: 'var(--dark-gray)' }}>{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => toggleUser(u._id)} style={{ padding: '6px 12px', background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.3)', borderRadius: 8, color: 'var(--gold)', cursor: 'pointer', fontSize: 12 }}>
                              {u.active ? 'Désactiver' : 'Activer'}
                            </button>
                          
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--gray)' }}>Aucun utilisateur inscrit.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MESSAGES CONTACT */}
        {tab === 'messages' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Formulaire Contact</div>
              <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 40, fontWeight: 700, color: 'var(--white)' }}>Messages Contact</h1>
            </div>
            {loading ? <div style={{ color: 'var(--gray)' }}>Chargement...</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {msgs.map((m) => (
                  <div key={m._id} onClick={() => !m.read && markRead(m._id)} style={{ padding: 24, background: m.read ? 'rgba(13,31,60,.4)' : 'rgba(201,168,76,.06)', border: `1px solid ${m.read ? 'var(--border-gold)' : 'rgba(201,168,76,.35)'}`, borderRadius: 16, cursor: m.read ? 'default' : 'pointer', transition: 'all .2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)' }}>{m.firstName} {m.lastName}</span>
                        {m.company && <span style={{ fontSize: 12, color: 'var(--gray)', marginLeft: 8 }}>— {m.company}</span>}
                        {!m.read && <span style={{ marginLeft: 10, fontSize: 10, padding: '3px 10px', background: 'rgba(201,168,76,.2)', color: 'var(--gold)', borderRadius: 20, fontWeight: 700 }}>NOUVEAU</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--dark-gray)' }}>{new Date(m.createdAt).toLocaleString('fr-FR')}</div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--teal)', marginBottom: 8 }}>{m.email} {m.service && `· ${m.service}`}</div>
                    <div style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.7 }}>{m.message}</div>
                    {!m.read && <div style={{ fontSize: 11, color: 'var(--gold)', marginTop: 12 }}>Cliquer pour marquer comme lu</div>}
                  </div>
                ))}
                {msgs.length === 0 && <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray)' }}>Aucun message reçu.</div>}
              </div>
            )}
          </div>
        )}

        {/* DIRECT MESSAGES */}
        {tab === 'direct' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Messagerie</div>
              <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 40, fontWeight: 700, color: 'var(--white)' }}>Messages Directs Clients</h1>
            </div>
            {loading ? <div style={{ color: 'var(--gray)' }}>Chargement...</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {directMsgs.map((m) => {
                  const isClient = m.from === 'client';
                  return (
                    <div key={m._id} style={{ padding: 20, background: isClient ? 'rgba(201,168,76,.05)' : 'rgba(11,180,176,.05)', border: `1px solid ${isClient ? 'rgba(201,168,76,.2)' : 'rgba(11,180,176,.2)'}`, borderRadius: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: isClient ? 'linear-gradient(135deg,var(--gold),var(--gold-light))' : 'linear-gradient(135deg,var(--teal),#0891B2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: isClient ? 'var(--navy-deep)' : 'white', flexShrink: 0 }}>
                            {isClient ? m.userName?.[0]?.toUpperCase() : <Anchor size={18} />}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>
                              {isClient ? m.userName : 'Équipe Bahria'}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 1 }}>
                              {isClient ? m.userEmail : 'Réponse automatique'}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 11, color: 'var(--dark-gray)' }}>{new Date(m.createdAt).toLocaleString('fr-FR')}</div>
                          <div style={{ fontSize: 11, color: isClient ? 'var(--gold)' : 'var(--teal)', marginTop: 4, fontWeight: 600 }}>
                            {m.subject}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.7, padding: '10px 14px', background: 'rgba(255,255,255,.03)', borderRadius: 10, whiteSpace: 'pre-line' }}>
                        {m.content}
                      </div>
                    </div>
                  );
                })}
                {directMsgs.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ marginBottom: 16 }}>
                      <MessageCircle size={48} color="var(--gray)" />
                    </div>
                    <div>Aucun message direct reçu.</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SHIPMENTS */}
        {tab === 'shipments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Logistique</div>
                <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 40, fontWeight: 700, color: 'var(--white)' }}>Expéditions</h1>
              </div>
              <button onClick={() => setShowShipForm(true)} style={{ padding: '12px 24px', background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', border: 'none', borderRadius: 12, color: 'var(--navy-deep)', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                + Nouvelle expédition
              </button>
            </div>

            {showShipForm && (
              <div style={{ padding: 28, background: 'rgba(201,168,76,.05)', border: '1px solid rgba(201,168,76,.3)', borderRadius: 18, marginBottom: 28 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 20 }}>Nouvelle expédition</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                  {[
                    { key: 'clientName', label: 'Nom Client *',    placeholder: 'Nom du client' },
                    { key: 'origin',     label: 'Origine *',       placeholder: "Port d'origine" },
                    { key: 'destination',label: 'Destination *',   placeholder: 'Port de destination' },
                    { key: 'cargo',      label: 'Marchandise',     placeholder: 'Type de cargo' },
                    { key: 'eta',        label: 'Date ETA',        placeholder: '', type: 'date' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 11, color: 'var(--gray)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                      <input type={f.type || 'text'} value={newShip[f.key]} onChange={e => setNewShip(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder} style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 8, color: 'var(--white)', fontSize: 13, outline: 'none' }} />
                    </div>
                  ))}

                  {/* Status */}
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--gray)', display: 'block', marginBottom: 6 }}>Statut</label>
                    <select value={newShip.status} onChange={e => setNewShip(p => ({ ...p, status: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', background: 'var(--navy-mid)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 8, color: 'var(--white)', fontSize: 13 }}>
                      {Object.keys(STATUS_COLORS).map(s => <option key={s} style={{ background: 'var(--navy-mid)' }}>{s}</option>)}
                    </select>
                  </div>

                  {/* Assign to client */}
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--gray)', display: 'block', marginBottom: 6 }}>Assigner à un client</label>
                    <select value={newShip.userId} onChange={e => setNewShip(p => ({ ...p, userId: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', background: 'var(--navy-mid)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 8, color: 'var(--white)', fontSize: 13 }}>
                      <option value="">Aucun client assigné</option>
                      {users.map(u => (
                        <option key={u._id} value={u._id} style={{ background: 'var(--navy-mid)' }}>
                          {u.firstName} {u.lastName} — {u.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={createShipment} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', border: 'none', borderRadius: 10, color: 'var(--navy-deep)', fontWeight: 700, cursor: 'pointer' }}>Créer</button>
                  <button onClick={() => setShowShipForm(false)} style={{ padding: '10px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, color: 'var(--gray)', cursor: 'pointer' }}>Annuler</button>
                </div>
              </div>
            )}

            {loading ? <div style={{ color: 'var(--gray)' }}>Chargement...</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {ships.map((s) => {
                  const sc = STATUS_COLORS[s.status] || STATUS_COLORS['En attente'];
                  return (
                    <div key={s._id} style={{ padding: 24, background: 'rgba(13,31,60,.5)', border: '1px solid var(--border-gold)', borderRadius: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', marginBottom: 4 }}>{s._id?.toString().slice(-8).toUpperCase()}</div>
                          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--white)' }}>{s.clientName}</div>
                          <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <MapPin size={14} /> {s.origin} → {s.destination}
                          </div>
                          {s.cargo && <div style={{ fontSize: 12, color: 'var(--dark-gray)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}><Package size={14} /> {s.cargo}</div>}
                          {s.eta   && <div style={{ fontSize: 12, color: 'var(--dark-gray)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} /> ETA: {s.eta}</div>}
                          {s.userId && <div style={{ fontSize: 11, color: 'var(--teal)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}><User size={12} /> Client assigné</div>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                          <span style={{ fontSize: 12, padding: '5px 14px', borderRadius: 20, background: sc.bg, color: sc.color, fontWeight: 600 }}>{s.status}</span>
                          <button onClick={() => deleteShipment(s._id)} style={{ padding: '6px 14px', background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: 12 }}>Supprimer</button>
                        </div>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${s.progress}%`, background: sc.color, borderRadius: 3, transition: 'width 1s ease' }} />
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--dark-gray)', marginTop: 6, textAlign: 'right' }}>{s.progress}%</div>
                    </div>
                  );
                })}
                {ships.length === 0 && <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray)' }}>Aucune expédition.</div>}
              </div>
            )}
          </div>
        )}

        {/* QUOTES */}
        {/* TRANSITS */}
        {tab === 'quotes' && (
          <TransitsAdminSection
            quotes={quotes}
            loading={loading}
            loadQuotes={loadQuotes}
            showToast={showToast}
          />
        )}
        {/* CALENDAR */}
        {tab === 'calendar' && <AdminCalendar />}

      </main>
    </div>
  );
}
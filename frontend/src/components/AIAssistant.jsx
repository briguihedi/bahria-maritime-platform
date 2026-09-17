import { useState, useRef } from 'react';
import api from '../utils/api';
import {
  FileText, Search, Upload, FolderOpen, Bot, CheckCircle,
  AlertTriangle, Lightbulb, Handshake, Clock, X, RefreshCw,
  FileSearch, ShieldCheck
} from 'lucide-react';

export default function AIAssistant() {
  const [activeTab, setActiveTab]     = useState('ocr');
  const [file, setFile]               = useState(null);
  const [preview, setPreview]         = useState(null);
  const [ocrResult, setOcrResult]     = useState(null);
  const [ocrLoading, setOcrLoading]   = useState(false);
  const [ocrError, setOcrError]       = useState(null);
  const fileInputRef                  = useRef(null);

  const [compForm, setCompForm]       = useState({ cargo: '', origin: '', destination: 'Tunisie', value: '' });
  const [compResult, setCompResult]   = useState(null);
  const [compLoading, setCompLoading] = useState(false);
  const [compError, setCompError]     = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setOcrResult(null);
    setOcrError(null);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const handleOCR = async () => {
    if (!file) return;
    setOcrLoading(true); setOcrError(null); setOcrResult(null);
    try {
      const formData = new FormData();
      formData.append('document', file);
      const { data } = await api.post('/ai/ocr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setOcrResult(data.data);
    } catch (err) {
      setOcrError(err.response?.data?.message || "Erreur lors de l'analyse.");
    }
    setOcrLoading(false);
  };

  const handleCompliance = async () => {
    if (!compForm.cargo) return;
    setCompLoading(true); setCompError(null); setCompResult(null);
    try {
      const { data } = await api.post('/ai/compliance', compForm);
      setCompResult(data.data);
    } catch (err) {
      setCompError(err.response?.data?.message || "Erreur lors de l'analyse.");
    }
    setCompLoading(false);
  };

  const card  = (extra = {}) => ({ padding: 24, background: 'rgba(13,31,60,.5)', border: '1px solid var(--border-gold)', borderRadius: 18, ...extra });
  const badge = (color, bg)  => ({ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: bg, color, fontWeight: 700 });

  const RISK_COLORS = {
    'Faible': { color: '#4ADE80', bg: 'rgba(74,222,128,.15)' },
    'Moyen':  { color: '#C9A84C', bg: 'rgba(201,168,76,.15)' },
    'Élevé':  { color: '#f87171', bg: 'rgba(248,113,113,.15)' },
  };

  const Dots = () => (
    <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 8 }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gold)', animation: `dot-bounce .8s ease-in-out ${i*.15}s infinite` }} />
      ))}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Intelligence Artificielle</div>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 44, fontWeight: 700, color: 'var(--white)', lineHeight: 1.1 }}>Assistant Douanier IA</h1>
        <p style={{ color: 'var(--gray)', fontSize: 15, marginTop: 10, maxWidth: 600 }}>
          Analysez vos documents automatiquement et obtenez une analyse complète de conformité douanière grâce à l'intelligence artificielle.
        </p>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <button onClick={() => setActiveTab('ocr')} style={{
          padding: '12px 28px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700,
          background: activeTab === 'ocr' ? 'linear-gradient(135deg,var(--gold),var(--gold-light))' : 'rgba(13,31,60,.5)',
          color: activeTab === 'ocr' ? 'var(--navy-deep)' : 'var(--gray)',
          border: activeTab === 'ocr' ? 'none' : '1px solid var(--border-gold)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <FileSearch size={16} strokeWidth={1.5} /> Analyse de Document (OCR)
        </button>
        <button onClick={() => setActiveTab('compliance')} style={{
          padding: '12px 28px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700,
          background: activeTab === 'compliance' ? 'linear-gradient(135deg,var(--gold),var(--gold-light))' : 'rgba(13,31,60,.5)',
          color: activeTab === 'compliance' ? 'var(--navy-deep)' : 'var(--gray)',
          border: activeTab === 'compliance' ? 'none' : '1px solid var(--border-gold)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <ShieldCheck size={16} strokeWidth={1.5} /> Conformité Douanière
        </button>
      </div>

      {/* OCR TAB */}
      {activeTab === 'ocr' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24 }}>
          <div>
            <div style={card()}>
              <div style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 700, marginBottom: 20, letterSpacing: 2, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Upload size={14} strokeWidth={2} /> Uploader un document
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ border: '2px dashed rgba(201,168,76,.3)', borderRadius: 16, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all .2s', marginBottom: 20, background: 'rgba(201,168,76,.03)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.background = 'rgba(201,168,76,.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,.3)'; e.currentTarget.style.background = 'rgba(201,168,76,.03)'; }}
              >
                <FolderOpen size={48} strokeWidth={1} color="var(--gold)" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: 15, color: 'var(--white)', fontWeight: 600, marginBottom: 6 }}>
                  {file ? file.name : 'Cliquer pour choisir un fichier'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--dark-gray)' }}>JPG, PNG, PDF — Max 10MB</div>
                <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: 'var(--gray)', marginBottom: 12 }}>Documents supportés :</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['Bill of Lading', 'Facture Commerciale', "Certificat d'Origine", 'DDM', 'DAE', 'Certificat Sanitaire'].map(d => (
                    <span key={d} style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.2)', color: 'var(--gold)', fontSize: 11 }}>{d}</span>
                  ))}
                </div>
              </div>

              {preview && (
                <div style={{ marginBottom: 20 }}>
                  <img src={preview} alt="preview" style={{ width: '100%', borderRadius: 12, maxHeight: 200, objectFit: 'contain', background: 'rgba(255,255,255,.05)' }} />
                </div>
              )}

              {file && !preview && (
                <div style={{ padding: '14px 18px', background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FileText size={24} strokeWidth={1.5} color="var(--gold)" />
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--white)', fontWeight: 600 }}>{file.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--dark-gray)' }}>{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
              )}

              <button onClick={handleOCR} disabled={!file || ocrLoading} style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: file ? 'pointer' : 'not-allowed',
                background: file ? 'linear-gradient(135deg,var(--gold),var(--gold-light))' : 'rgba(255,255,255,.05)',
                color: file ? 'var(--navy-deep)' : 'var(--dark-gray)', fontWeight: 700, fontSize: 15, opacity: ocrLoading ? .7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {ocrLoading
                  ? <><Bot size={18} strokeWidth={1.5} /> Analyse en cours...</>
                  : <><Search size={18} strokeWidth={1.5} /> Analyser avec l'IA</>}
              </button>

              {ocrError && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 10, color: '#f87171', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <X size={14} strokeWidth={2} /> {ocrError}
                </div>
              )}
            </div>
          </div>

          {/* OCR Result */}
          <div>
            {ocrLoading && (
              <div style={{ ...card(), textAlign: 'center', padding: 60 }}>
                <Bot size={48} strokeWidth={1} color="var(--gold)" style={{ margin: '0 auto 20px' }} />
                <div style={{ fontSize: 16, color: 'var(--white)', fontWeight: 600, marginBottom: 8 }}>Analyse en cours...</div>
                <div style={{ fontSize: 13, color: 'var(--gray)' }}>L'IA lit votre document</div>
                <Dots />
              </div>
            )}

            {ocrResult && !ocrLoading && (
              <div style={card()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>Résultat de l'analyse</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--white)' }}>{ocrResult.document_type || 'Document analysé'}</div>
                  </div>
                  <CheckCircle size={28} strokeWidth={1.5} color="#4ADE80" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {Object.entries(ocrResult).map(([key, value]) => {
                    if (!value || value === 'Non précisé' || value === 'N/A' || key === 'document_type') return null;
                    const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
                    const labels = {
                      document_number: 'N° Document', date: 'Date',
                      shipper: 'Expéditeur', consignee: 'Destinataire',
                      port_of_loading: 'Port de chargement', port_of_discharge: 'Port de déchargement',
                      vessel: 'Navire', cargo_description: 'Marchandise',
                      quantity: 'Quantité', weight: 'Poids',
                      value: 'Valeur', currency: 'Devise',
                      country_of_origin: "Pays d'origine", incoterms: 'Incoterms',
                      additional_info: 'Informations complémentaires',
                    };
                    const fullWidth = ['cargo_description', 'additional_info'].includes(key);
                    return (
                      <div key={key} style={{ padding: '12px 14px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, gridColumn: fullWidth ? '1 / -1' : 'auto' }}>
                        <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{labels[key] || key}</div>
                        <div style={{ fontSize: 13, color: 'var(--white)', fontWeight: 500, wordBreak: 'break-word', lineHeight: 1.6 }}>{displayValue}</div>
                      </div>
                    );
                  })}
                </div>

                <button onClick={() => { setFile(null); setPreview(null); setOcrResult(null); fileInputRef.current.value = ''; }}
                  style={{ width: '100%', marginTop: 20, padding: '10px', background: 'transparent', border: '1px solid rgba(201,168,76,.2)', borderRadius: 10, color: 'var(--gold)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <RefreshCw size={14} strokeWidth={1.5} /> Analyser un autre document
                </button>
              </div>
            )}

            {!ocrResult && !ocrLoading && (
              <div style={{ ...card(), textAlign: 'center', padding: 60 }}>
                <FileText size={64} strokeWidth={0.8} color="var(--dark-gray)" style={{ margin: '0 auto 20px' }} />
                <div style={{ fontSize: 16, color: 'var(--white)', fontWeight: 600, marginBottom: 8 }}>Prêt à analyser</div>
                <div style={{ fontSize: 13, color: 'var(--gray)', maxWidth: 300, margin: '0 auto' }}>
                  Uploadez un document maritime ou douanier et l'IA extraira toutes les informations automatiquement.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPLIANCE TAB */}
      {activeTab === 'compliance' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 24 }}>
          <div style={card()}>
            <div style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 700, marginBottom: 20, letterSpacing: 2, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={14} strokeWidth={2} /> Analyse de Conformité
            </div>

            {[
              { key: 'cargo',       label: 'Description de la marchandise *', placeholder: 'Ex: Équipements électroniques, téléphones mobiles, 500 unités', type: 'textarea' },
              { key: 'origin',      label: "Pays d'origine",                  placeholder: 'Ex: Chine, France, Allemagne...' },
              { key: 'destination', label: 'Pays de destination',             placeholder: 'Tunisie' },
              { key: 'value',       label: 'Valeur estimée (USD)',             placeholder: 'Ex: 15000' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: 'var(--gray)', display: 'block', marginBottom: 8 }}>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea value={compForm[f.key]} onChange={e => setCompForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} rows={3}
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.18)', borderRadius: 10, color: 'var(--white)', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'var(--ff-body)' }} />
                ) : (
                  <input value={compForm[f.key]} onChange={e => setCompForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.18)', borderRadius: 10, color: 'var(--white)', fontSize: 13, outline: 'none' }} />
                )}
              </div>
            ))}

            <button onClick={handleCompliance} disabled={!compForm.cargo || compLoading} style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              cursor: compForm.cargo ? 'pointer' : 'not-allowed',
              background: compForm.cargo ? 'linear-gradient(135deg,var(--gold),var(--gold-light))' : 'rgba(255,255,255,.05)',
              color: compForm.cargo ? 'var(--navy-deep)' : 'var(--dark-gray)',
              fontWeight: 700, fontSize: 15, opacity: compLoading ? .7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {compLoading
                ? <><Bot size={18} strokeWidth={1.5} /> Analyse en cours...</>
                : <><ShieldCheck size={18} strokeWidth={1.5} /> Analyser la conformité</>}
            </button>

            {compError && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 10, color: '#f87171', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <X size={14} strokeWidth={2} /> {compError}
              </div>
            )}
          </div>

          {/* Compliance Result */}
          <div>
            {compLoading && (
              <div style={{ ...card(), textAlign: 'center', padding: 60 }}>
                <Bot size={48} strokeWidth={1} color="var(--gold)" style={{ margin: '0 auto 20px' }} />
                <div style={{ fontSize: 16, color: 'var(--white)', fontWeight: 600, marginBottom: 8 }}>Analyse en cours...</div>
                <div style={{ fontSize: 13, color: 'var(--gray)' }}>L'IA analyse les réglementations douanières</div>
                <Dots />
              </div>
            )}

            {compResult && !compLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={card()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Classification</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--white)', marginBottom: 6 }}>{compResult.cargo_classification}</div>
                      <div style={{ fontSize: 14, color: 'var(--teal)' }}>Code SH : <strong>{compResult.hs_code}</strong></div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--gray)', marginBottom: 6 }}>Niveau de risque</div>
                      <span style={badge(RISK_COLORS[compResult.risk_level]?.color || '#8899AA', RISK_COLORS[compResult.risk_level]?.bg || 'rgba(136,153,170,.12)')}>
                        {compResult.risk_level}
                      </span>
                    </div>
                  </div>
                  {compResult.estimated_processing_time && (
                    <div style={{ marginTop: 12, padding: '8px 14px', background: 'rgba(11,180,176,.08)', border: '1px solid rgba(11,180,176,.15)', borderRadius: 8, fontSize: 13, color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Clock size={14} strokeWidth={1.5} /> Délai estimé : {compResult.estimated_processing_time}
                    </div>
                  )}
                </div>

                {compResult.required_documents?.length > 0 && (
                  <div style={card()}>
                    <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Documents requis</div>
                    {compResult.required_documents.map((doc, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < compResult.required_documents.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                        <div style={{ flexShrink: 0, marginTop: 2 }}>
                          {doc.mandatory
                            ? <AlertTriangle size={18} strokeWidth={1.5} color="#f87171" />
                            : <AlertTriangle size={18} strokeWidth={1.5} color="#C9A84C" />}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginBottom: 3 }}>
                            {doc.name}
                            <span style={{ marginLeft: 8, ...badge(doc.mandatory ? '#f87171' : '#C9A84C', doc.mandatory ? 'rgba(248,113,113,.12)' : 'rgba(201,168,76,.12)') }}>
                              {doc.mandatory ? 'Obligatoire' : 'Recommandé'}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--gray)' }}>{doc.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {compResult.customs_duties && (
                  <div style={card()}>
                    <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Droits & Taxes</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {Object.entries(compResult.customs_duties).map(([key, val]) => {
                        const labels = { import_duty: 'Droit import', vat: 'TVA', other_taxes: 'Autres taxes', total_estimated: 'Total estimé' };
                        return (
                          <div key={key} style={{ padding: '12px 14px', background: 'rgba(255,255,255,.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,.06)' }}>
                            <div style={{ fontSize: 10, color: 'var(--gray)', marginBottom: 4 }}>{labels[key] || key}</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: key === 'total_estimated' ? 'var(--gold)' : 'var(--white)' }}>{val}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {compResult.alerts?.length > 0 && (
                  <div style={card()}>
                    <div style={{ fontSize: 11, color: '#f87171', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle size={13} strokeWidth={2} /> Alertes
                    </div>
                    {compResult.alerts.map((alert, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < compResult.alerts.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                        <AlertTriangle size={14} strokeWidth={1.5} color="#f87171" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 13, color: 'var(--gray)' }}>{alert}</span>
                      </div>
                    ))}
                  </div>
                )}

                {compResult.recommendations?.length > 0 && (
                  <div style={card()}>
                    <div style={{ fontSize: 11, color: '#4ADE80', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Lightbulb size={13} strokeWidth={2} /> Recommandations
                    </div>
                    {compResult.recommendations.map((rec, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < compResult.recommendations.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                        <CheckCircle size={14} strokeWidth={1.5} color="#4ADE80" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 13, color: 'var(--gray)' }}>{rec}</span>
                      </div>
                    ))}
                  </div>
                )}

                {compResult.applicable_agreements?.length > 0 && (
                  <div style={card()}>
                    <div style={{ fontSize: 11, color: 'var(--teal)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Handshake size={13} strokeWidth={2} /> Accords Applicables
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {compResult.applicable_agreements.map((ag, i) => (
                        <span key={i} style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(11,180,176,.1)', border: '1px solid rgba(11,180,176,.25)', color: 'var(--teal)', fontSize: 12 }}>{ag}</span>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => { setCompResult(null); setCompForm({ cargo: '', origin: '', destination: 'Tunisie', value: '' }); }}
                  style={{ padding: '10px', background: 'transparent', border: '1px solid rgba(201,168,76,.2)', borderRadius: 10, color: 'var(--gold)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <RefreshCw size={14} strokeWidth={1.5} /> Nouvelle analyse
                </button>
              </div>
            )}

            {!compResult && !compLoading && (
              <div style={{ ...card(), textAlign: 'center', padding: 60 }}>
                <ShieldCheck size={64} strokeWidth={0.8} color="var(--dark-gray)" style={{ margin: '0 auto 20px' }} />
                <div style={{ fontSize: 16, color: 'var(--white)', fontWeight: 600, marginBottom: 8 }}>Analyse de Conformité</div>
                <div style={{ fontSize: 13, color: 'var(--gray)', maxWidth: 320, margin: '0 auto', lineHeight: 1.8 }}>
                  Décrivez votre marchandise et l'IA générera une analyse complète : code douanier, documents requis, droits de douane et alertes.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
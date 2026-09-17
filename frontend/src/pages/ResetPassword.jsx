import { useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Anchor, Eye, EyeOff, CheckCircle, XCircle, KeyRound } from 'lucide-react';
import api from '../utils/api';

export default function ResetPassword() {
  const [searchParams]          = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [showCpw, setShowCpw]   = useState(false);
  const [status, setStatus]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async () => {
    if (!password || !confirm) { setStatus({ type: 'error', msg: 'Tous les champs sont requis.' }); return; }
    if (password.length < 6)   { setStatus({ type: 'error', msg: 'Minimum 6 caractères.' }); return; }
    if (password !== confirm)  { setStatus({ type: 'error', msg: 'Les mots de passe ne correspondent pas.' }); return; }
    if (!token)                { setStatus({ type: 'error', msg: 'Token manquant.' }); return; }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { token, password });
      setStatus({ type: 'success', msg: data.message });
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Lien invalide ou expiré.' });
    }
    setLoading(false);
  };

  const inp = (val, set, show, setShow, placeholder) => (
    <div style={{ position: 'relative', marginBottom: 16 }}>
      <input
        type={show ? 'text' : 'password'}
        value={val}
        onChange={e => set(e.target.value)}
        placeholder={placeholder}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        style={{ width: '100%', padding: '13px 44px 13px 16px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.18)', borderRadius: 10, color: 'var(--white)', fontSize: 14, outline: 'none', fontFamily: 'var(--ff-body)' }}
      />
      <button type="button" onClick={() => setShow(p => !p)}
        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
        {show ? <EyeOff size={16} strokeWidth={1.5} color="var(--gray)" /> : <Eye size={16} strokeWidth={1.5} color="var(--gray)" />}
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#070E1C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ff-body)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 460, background: 'linear-gradient(160deg,#0A1628,#0D1F3C)', border: '1px solid rgba(201,168,76,.25)', borderRadius: 24, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '28px 32px 24px', borderBottom: '1px solid rgba(201,168,76,.12)', background: 'rgba(201,168,76,.04)', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Anchor size={24} strokeWidth={1.5} color="var(--gold)" />
            <span style={{ fontFamily: 'var(--ff-display)', fontSize: 18, fontWeight: 700, color: 'var(--white)', letterSpacing: 2 }}>GROUPE BAHRIA</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '40px 36px' }}>

          {status?.type === 'success' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(74,222,128,.1)', border: '2px solid rgba(74,222,128,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle size={40} strokeWidth={1.5} color="#4ADE80" />
              </div>
              <div style={{ fontFamily: 'var(--ff-display)', fontSize: 22, fontWeight: 700, color: 'var(--white)', marginBottom: 12 }}>
                Mot de passe modifié !
              </div>
              <div style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.7, marginBottom: 32 }}>
                Votre mot de passe a été réinitialisé avec succès.<br />Vous pouvez maintenant vous connecter.
              </div>
              <button onClick={() => navigate('/')}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', border: 'none', borderRadius: 12, color: 'var(--navy-deep)', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                Se connecter →
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <KeyRound size={22} strokeWidth={1.5} color="var(--gold)" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--ff-display)', fontSize: 20, fontWeight: 700, color: 'var(--white)' }}>Nouveau mot de passe</div>
                  <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 2 }}>Choisissez un mot de passe sécurisé</div>
                </div>
              </div>

              <label style={{ fontSize: 12, color: 'var(--gray)', display: 'block', marginBottom: 8 }}>Nouveau mot de passe *</label>
              {inp(password, setPassword, showPw, setShowPw, '••••••••')}

              <label style={{ fontSize: 12, color: 'var(--gray)', display: 'block', marginBottom: 8 }}>Confirmation *</label>
              {inp(confirm, setConfirm, showCpw, setShowCpw, '••••••••')}

              {status?.type === 'error' && (
                <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 10, color: '#f87171', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <XCircle size={14} strokeWidth={2} /> {status.msg}
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', border: 'none', borderRadius: 12, color: 'var(--navy-deep)', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1 }}>
                {loading ? '⏳ En cours...' : 'Réinitialiser le mot de passe →'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button onClick={() => navigate('/')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--gray)', textDecoration: 'underline', padding: 0 }}>
                  Retour à l'accueil
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
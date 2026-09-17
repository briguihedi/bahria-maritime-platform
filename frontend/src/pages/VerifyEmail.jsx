import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Anchor, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../utils/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [msg, setMsg]       = useState('');
  const navigate = useNavigate();
  const called   = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const token = searchParams.get('token');
    if (!token) { setStatus('error'); setMsg('Lien invalide.'); return; }

    api.get('/auth/verify-email', { params: { token } })
      .then(({ data }) => { setStatus('success'); setMsg(data.message); })
      .catch(err => { setStatus('error'); setMsg(err.response?.data?.message || 'Lien invalide ou expiré.'); });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#070E1C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ff-body)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 480, background: 'linear-gradient(160deg,#0A1628,#0D1F3C)', border: '1px solid rgba(201,168,76,.25)', borderRadius: 24, overflow: 'hidden', textAlign: 'center' }}>

        {/* Header */}
        <div style={{ padding: '28px 32px 24px', borderBottom: '1px solid rgba(201,168,76,.12)', background: 'rgba(201,168,76,.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Anchor size={24} strokeWidth={1.5} color="var(--gold)" />
            <span style={{ fontFamily: 'var(--ff-display)', fontSize: 18, fontWeight: 700, color: 'var(--white)', letterSpacing: 2 }}>
              GROUPE BAHRIA
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '48px 40px' }}>

          {/* Loading */}
          {status === 'loading' && (
            <>
              <Loader2 size={56} strokeWidth={1} color="var(--gold)"
                style={{ margin: '0 auto 24px', display: 'block', animation: 'spin 1s linear infinite' }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--white)', marginBottom: 10 }}>
                Vérification en cours...
              </div>
              <div style={{ fontSize: 14, color: 'var(--gray)' }}>Veuillez patienter.</div>
            </>
          )}

          {/* Success */}
          {status === 'success' && (
            <>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(74,222,128,.1)', border: '2px solid rgba(74,222,128,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle size={40} strokeWidth={1.5} color="#4ADE80" />
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--white)', fontFamily: 'var(--ff-display)', marginBottom: 12 }}>
                Email vérifié !
              </div>
              <div style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.7, marginBottom: 32 }}>
                Votre compte a été activé avec succès.<br />
                Vous pouvez maintenant vous connecter.
              </div>
              <button onClick={() => navigate('/')} style={{ padding: '14px 36px', background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', border: 'none', borderRadius: 12, color: 'var(--navy-deep)', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                Se connecter →
              </button>
            </>
          )}

          {/* Error */}
          {status === 'error' && (
            <>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(248,113,113,.1)', border: '2px solid rgba(248,113,113,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <XCircle size={40} strokeWidth={1.5} color="#f87171" />
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--white)', fontFamily: 'var(--ff-display)', marginBottom: 12 }}>
                Lien invalide
              </div>
              <div style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.7, marginBottom: 32 }}>{msg}</div>
              <button onClick={() => navigate('/')} style={{ padding: '14px 36px', background: 'transparent', border: '1px solid rgba(201,168,76,.3)', borderRadius: 12, color: 'var(--gold)', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                Retour à l'accueil
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
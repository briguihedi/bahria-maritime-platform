import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Anchor, Eye, EyeOff, X, Mail } from 'lucide-react';
import api from '../utils/api';

export default function AuthModal({ mode, onClose, onSwitchMode }) {
  const [form, setForm]               = useState({ firstName: '', lastName: '', company: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw]           = useState(false);
  const [showCpw, setShowCpw]         = useState(false);
  const [status, setStatus]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [showForgot, setShowForgot]   = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setStatus(null);
    setShowForgot(false);
    setForgotEmail('');
    setForm({ firstName: '', lastName: '', company: '', email: '', password: '', confirmPassword: '' });
  }, [mode]);

  const isLogin = mode === 'login';
  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setStatus(null);
    if (!form.email || !form.password) {
      setStatus({ type: 'error', msg: 'Email et mot de passe requis.' }); return;
    }
    if (!isLogin) {
      if (!form.firstName) { setStatus({ type: 'error', msg: 'Prénom requis.' }); return; }
      if (form.password !== form.confirmPassword) { setStatus({ type: 'error', msg: 'Les mots de passe ne correspondent pas.' }); return; }
      if (form.password.length < 6) { setStatus({ type: 'error', msg: 'Mot de passe : 6 caractères minimum.' }); return; }
    }
    setLoading(true);
    try {
      if (isLogin) {
        const data = await login(form.email, form.password);
        setStatus({ type: 'success', msg: `✓ Bienvenue ${data.user.firstName} !` });
        setTimeout(() => { onClose(); navigate(data.user.role === 'admin' ? '/admin' : '/dashboard'); }, 1000);
      } else {
        await register({
          firstName: form.firstName,
          lastName:  form.lastName,
          company:   form.company,
          email:     form.email,
          password:  form.password,
        });
        setStatus({ type: 'verify', email: form.email });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Erreur serveur.' });
    } finally { setLoading(false); }
  };

  const handleForgot = async () => {
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setStatus({ type: 'forgot_sent', email: forgotEmail });
      setShowForgot(false);
      setForgotEmail('');
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Erreur serveur.' });
    }
    setForgotLoading(false);
  };

  const inp = { className: 'auth-input', onChange: handleChange, onKeyDown: e => e.key === 'Enter' && handleSubmit() };

  return (
    <div id="auth-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal">

        {/* ── CLOSE ── */}
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, color: 'var(--gray)', cursor: 'pointer', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <X size={14} />
        </button>

        {/* ── EMAIL SENT SUCCESS SCREEN (inscription) ── */}
        {status?.type === 'verify' ? (
          <div style={{ padding: '48px 36px', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(11,180,176,.1)', border: '2px solid rgba(11,180,176,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Mail size={36} strokeWidth={1.2} color="var(--teal)" />
            </div>
            <div style={{ fontFamily: 'var(--ff-display)', fontSize: 24, fontWeight: 700, color: 'var(--white)', marginBottom: 12 }}>
              Vérifiez votre email !
            </div>
            <div style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.8, marginBottom: 8 }}>
              Un lien d'activation a été envoyé à
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold)', marginBottom: 24 }}>
              {status.email}
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, marginBottom: 28 }}>
              <div style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.8 }}>
                Cliquez sur le lien dans l'email pour activer votre compte.<br />
                <span style={{ color: 'var(--dark-gray)', fontSize: 12 }}>Le lien expire dans 24 heures.</span>
              </div>
            </div>
            <button onClick={onClose} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', border: 'none', borderRadius: 12, color: 'var(--navy-deep)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Fermer
            </button>
            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--dark-gray)' }}>
              Pas reçu l'email ?{' '}
              <button type="button" onClick={() => setStatus(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--gold)', textDecoration: 'underline', padding: 0 }}>
                Réessayer
              </button>
            </div>
          </div>

        ) : status?.type === 'forgot_sent' ? (
          /* ── FORGOT PASSWORD EMAIL SENT SCREEN ── */
          <div style={{ padding: '48px 36px', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(201,168,76,.1)', border: '2px solid rgba(201,168,76,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Mail size={36} strokeWidth={1.2} color="var(--gold)" />
            </div>
            <div style={{ fontFamily: 'var(--ff-display)', fontSize: 22, fontWeight: 700, color: 'var(--white)', marginBottom: 12 }}>
              Email envoyé !
            </div>
            <div style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.8, marginBottom: 8 }}>
              Un lien de réinitialisation a été envoyé à
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold)', marginBottom: 24 }}>
              {status.email}
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, marginBottom: 28 }}>
              <div style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.8 }}>
                Cliquez sur le lien dans l'email pour réinitialiser votre mot de passe.<br />
                <span style={{ color: 'var(--dark-gray)', fontSize: 12 }}>Le lien expire dans 1 heure.</span>
              </div>
            </div>
            <button onClick={() => setStatus(null)}
              style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,var(--gold),var(--gold-light))', border: 'none', borderRadius: 12, color: 'var(--navy-deep)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Retour à la connexion
            </button>
          </div>

        ) : (
          <>
            {/* ── HEADER ── */}
            <div className="auth-head">
              <div className="auth-logo">
                <Anchor size={26} strokeWidth={1.5} color="var(--gold)" />
                <span>GROUPE BAHRIA</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 24, fontWeight: 700 }}>
                {isLogin ? 'Se connecter' : "S'inscrire"}
              </div>
            </div>

            {/* ── BODY ── */}
            <div className="auth-body">

              {/* Signup extra fields */}
              {!isLogin && (
                <>
                  <div className="auth-fields-extra" style={{ marginBottom: 12 }}>
                    <div>
                      <label className="auth-label">Prénom *</label>
                      <input {...inp} name="firstName" value={form.firstName} placeholder="Mohamed" autoFocus />
                    </div>
                    <div>
                      <label className="auth-label">Nom</label>
                      <input {...inp} name="lastName" value={form.lastName} placeholder="Ben Ali" />
                    </div>
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Société (optionnel)</label>
                    <input {...inp} name="company" value={form.company} placeholder="Votre entreprise" />
                  </div>
                </>
              )}

              {/* Email */}
              <div className="auth-field">
                <label className="auth-label">Adresse email *</label>
                <input {...inp} type="email" name="email" value={form.email} placeholder="votre@email.com" autoFocus={isLogin} />
              </div>

              {/* Password */}
              <div className="auth-field">
                <label className="auth-label">Mot de passe *</label>
                <input {...inp} type={showPw ? 'text' : 'password'} name="password" value={form.password} placeholder="••••••••" style={{ paddingRight: 44 }} />
                <button className="auth-eye" type="button" onClick={() => setShowPw(p => !p)}>
                  {showPw ? <EyeOff size={16} strokeWidth={1.5} color="var(--gray)" /> : <Eye size={16} strokeWidth={1.5} color="var(--gray)" />}
                </button>
              </div>

              {/* Confirm password — signup only */}
              {!isLogin && (
                <div className="auth-field">
                  <label className="auth-label">Confirmation du mot de passe *</label>
                  <input {...inp} type={showCpw ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} placeholder="••••••••" style={{ paddingRight: 44 }} />
                  <button className="auth-eye" type="button" onClick={() => setShowCpw(p => !p)}>
                    {showCpw ? <EyeOff size={16} strokeWidth={1.5} color="var(--gray)" /> : <Eye size={16} strokeWidth={1.5} color="var(--gray)" />}
                  </button>
                </div>
              )}

              {/* ── LOGIN EXTRAS ── */}
              {isLogin && (
                <div style={{ marginBottom: 16 }}>

                  {/* Mot de passe oublié */}
                  {!showForgot ? (
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                      <button type="button" onClick={() => setShowForgot(true)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--gold)', textDecoration: 'underline', padding: 0 }}>
                        Mot de passe oublié ?
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: '14px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(201,168,76,.15)', borderRadius: 12, marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 2 }}>
                        Réinitialiser le mot de passe
                      </div>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleForgot()}
                        placeholder="votre@email.com"
                        style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 9, color: 'var(--white)', fontSize: 13, outline: 'none', marginBottom: 10 }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" onClick={handleForgot}
                          disabled={forgotLoading || !forgotEmail}
                          style={{ flex: 1, padding: '9px', background: forgotEmail ? 'linear-gradient(135deg,var(--gold),var(--gold-light))' : 'rgba(255,255,255,.05)', border: 'none', borderRadius: 8, color: forgotEmail ? 'var(--navy-deep)' : 'var(--dark-gray)', fontWeight: 700, cursor: forgotEmail ? 'pointer' : 'not-allowed', fontSize: 13 }}>
                          {forgotLoading ? '⏳...' : 'Envoyer →'}
                        </button>
                        <button type="button" onClick={() => { setShowForgot(false); setForgotEmail(''); }}
                          style={{ padding: '9px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, color: 'var(--gray)', cursor: 'pointer', fontSize: 12 }}>
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Pas de compte */}
                  <div style={{ textAlign: 'center', padding: '12px 16px', background: 'rgba(255,255,255,.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,.06)' }}>
                    <span style={{ fontSize: 13, color: 'var(--gray)' }}>Vous n'avez pas de compte ? </span>
                    <button type="button" onClick={() => onSwitchMode('signup')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--gold)', fontWeight: 700, padding: 0 }}>
                      S'inscrire →
                    </button>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button className="btn-gold auth-submit" onClick={handleSubmit}
                disabled={loading || status?.type === 'success'}
                style={status?.type === 'success' ? { background: 'linear-gradient(135deg,#4ADE80,#22C55E)', opacity: 1 } : {}}>
                {loading
                  ? '⏳ En cours...'
                  : status?.type === 'success'
                    ? status.msg
                    : isLogin ? 'Se connecter →' : 'Créer mon compte →'}
              </button>

              {/* Status messages */}
              {status?.type === 'error' && (
                <p className="auth-error">⚠️ {status.msg}</p>
              )}
              {status?.type === 'info' && (
                <p style={{ fontSize: 12, color: 'var(--teal)', marginTop: 10, textAlign: 'center', padding: '10px 14px', background: 'rgba(11,180,176,.08)', border: '1px solid rgba(11,180,176,.2)', borderRadius: 8 }}>
                  ℹ️ {status.msg}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Settings, User, LogOut, LayoutDashboard, UserPlus } from 'lucide-react';

export default function Navbar({ onOpenAuth, user, onLogout }) {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const close      = () => setMenuOpen(false);
  const changeLang = lang => i18n.changeLanguage(lang);

  const NAV_LINKS = [
    { href: '#services',  label: t('nav.services')  },
    { href: '#about',     label: t('nav.about')     },
    { href: '#group',     label: t('nav.group')     },
    { href: '#documents', label: t('nav.documents') },
    { href: '#portal',    label: t('nav.portal')    },
    { href: '#contact',   label: t('nav.contact')   },
  ];

  const handleDashboard = () => {
    if (user?.role === 'admin') navigate('/admin');
    else navigate('/dashboard');
  };

  const getIcon = () => {
    if (user?.role === 'admin') return <Settings size={16} strokeWidth={1.5} />;
    return <User size={16} strokeWidth={1.5} />;
  };

  return (
    <>
      <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
        <div className="nav-inner">

          {/* Logo */}
          <a href="#hero" className="logo">
            <img src="/Logo principale.png" alt="Groupe Bahria" style={{ height: '35px', width: 'auto', objectFit: 'contain' }} />
            <div className="logo-text">
              <div className="brand" style={{ fontSize: '14px' }}>GROUPE BAHRIA</div>
              <div className="sub"   style={{ fontSize: '7px'  }}>TRANSPORT MARITIME & LOGISTIQUE</div>
            </div>
          </a>

          {/* Nav links */}
          <ul className="nav-links">
            {NAV_LINKS.map(l => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
          </ul>

          {/* CTA */}
          <div className="nav-cta">
            {/* Lang switcher */}
            <div className="nav-lang" style={{ marginRight: '20px' }}>
              <button className={`lang-btn ${i18n.language === 'fr' ? 'active' : ''}`} onClick={() => changeLang('fr')}>FR</button>
              <span className="lang-divider">|</span>
              <button className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`} onClick={() => changeLang('en')}>EN</button>
            </div>

            {user ? (
              <>
                <button className="btn-outline" onClick={handleDashboard}
                  style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  {getIcon()} {user.firstName}
                </button>
                <button className="btn-gold" onClick={onLogout}
                  style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <LogOut size={15} strokeWidth={1.5} /> {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                {/* Connexion */}
                <button className="btn-outline" onClick={() => onOpenAuth('login')}
                  style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <User size={15} strokeWidth={1.5} /> Se connecter
                </button>
                {/* S'inscrire */}
                <button className="btn-gold" onClick={() => onOpenAuth('signup')}
                  style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <UserPlus size={15} strokeWidth={1.5} /> S'inscrire
                </button>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} onClick={close}>{l.label}</a>
          ))}
          <div className="mobile-menu-cta">
            {user ? (
              <>
                <button className="btn-outline" onClick={() => { handleDashboard(); close(); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  <LayoutDashboard size={15} strokeWidth={1.5} /> Mon espace
                </button>
                <button className="btn-gold" onClick={() => { onLogout(); close(); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  <LogOut size={15} strokeWidth={1.5} /> {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                {/* Mobile — Connexion */}
                <button className="btn-outline" onClick={() => { onOpenAuth('login'); close(); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  <User size={15} strokeWidth={1.5} /> Se connecter
                </button>
                {/* Mobile — S'inscrire */}
                <button className="btn-gold" onClick={() => { onOpenAuth('signup'); close(); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  <UserPlus size={15} strokeWidth={1.5} /> S'inscrire
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
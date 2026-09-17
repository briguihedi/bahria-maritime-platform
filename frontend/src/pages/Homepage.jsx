import { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Gallery from '../components/Gallery';
import Services from '../components/Services';
import About from '../components/About';
import Group from '../components/Group';
import CtaBanner from '../components/CtaBanner';
import Portal from '../components/Portal';
import Documents from '../components/Documents';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';

export default function HomePage({ onOpenAuth })  {
  const [authModal, setAuthModal] = useState(null);
  const { user, logout } = useAuth();

  return (
    <>
      <Navbar onOpenAuth={setAuthModal} user={user} onLogout={logout} />
      <main>
        <Hero     onOpenAuth={setAuthModal} />
        <Gallery />
        <Services onOpenAuth={onOpenAuth} />
        <About />
        <Group />
        <CtaBanner onOpenAuth={setAuthModal} />
        <Portal   onOpenAuth={setAuthModal} user={user} />
        <Documents />
        <Contact />
      </main>
      <Footer />
      <Chatbot />
      {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} />}
    </>
  );
}
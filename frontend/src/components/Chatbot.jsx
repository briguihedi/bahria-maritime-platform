import { useState, useRef, useEffect } from 'react';
import api from '../utils/api';

const SUGGESTIONS = [
  '📦 Quels sont vos services ?',
  '📄 Documents pour importer ?',
  '📍 Votre adresse et contact ?',
  '💰 Demander un devis',
];

const WELCOME = 'Bonjour ! Je suis Bahria, l\'assistant virtuel du Groupe BAHRIA. 👋\n\nComment puis-je vous aider aujourd\'hui ?';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'bot', text: WELCOME }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setShowSuggestions(false);
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const { data } = await api.post('/chat', { message: msg });
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Désolé, une erreur s\'est produite.\n📞 Appelez-nous : +216 73 322 518' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button id="chat-btn" onClick={() => setOpen(o => !o)} aria-label="Chat Bahria">
        {open ? '✕' : '⚓'}
      </button>

      {open && (
        <div id="chatbox">
          <div className="chat-head">
            <div className="chat-avatar">⚓</div>
            <div className="chat-head-info">
              <div className="chat-head-name">Assistant Bahria</div>
              <div className="chat-head-status">
                <div className="chat-status-dot" /> En ligne · Répond rapidement
              </div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div className={`msg ${m.role}`} key={i}>
                <div className="msg-bubble">{m.text}</div>
              </div>
            ))}
            {loading && (
              <div className="msg bot">
                <div className="typing"><span /><span /><span /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {showSuggestions && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="sugg-btn" onClick={() => sendMessage(s)}>{s}</button>
              ))}
            </div>
          )}

          <div className="chat-input-area">
            <input
              ref={inputRef}
              className="chat-input"
              placeholder="Votre message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button className="chat-send" onClick={() => sendMessage()} disabled={loading}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}

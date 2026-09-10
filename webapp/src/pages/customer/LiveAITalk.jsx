import React, { useState, useEffect, useRef } from 'react';
import { Settings, Send, Bot, User as UserIcon, Loader2, Trash2 } from 'lucide-react';
import WebAppHeader from '../../components/WebAppHeader';
import { useStore } from '../../StoreContext';

const STORAGE_KEY = 'exotic_ai_chat_history';

export default function LiveAITalk() {
  const { showToast } = useStore();
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Persist chat history to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Chat history cleared.', 'success');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;

    const userText = chatInput.trim();
    setChatInput('');

    const newMessages = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response.');
      }

      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
      setMessages(prev => [...prev, { role: 'ai', text: '⚠️ ' + err.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage(e);
    }
  };

  return (
    <div style={{ height: '100vh', background: 'var(--bg-color)', display: 'flex', flexDirection: 'column' }}>
      <WebAppHeader />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '800px', margin: '0 auto', width: '100%', padding: '0 1rem 1rem', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid rgba(212, 163, 115, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ background: 'rgba(76, 175, 80, 0.1)', padding: '0.6rem', borderRadius: '50%' }}>
              <Bot size={24} color="#4caf50" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-color)', margin: 0, fontSize: '1.3rem' }}>AI Chat Companion</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#4caf50' }}>● Online</p>
            </div>
          </div>
          <button
            onClick={clearHistory}
            title="Clear chat history"
            style={{ background: 'rgba(244, 67, 54, 0.1)', border: '1px solid rgba(244, 67, 54, 0.2)', color: '#f44336', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
          >
            <Trash2 size={16} /> Clear
          </button>
        </div>

        {/* Chat History Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            padding: '1.5rem 0',
          }}
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto', opacity: 0.7 }}>
              <Bot size={56} style={{ marginBottom: '1rem', color: '#4caf50', opacity: 0.4 }} />
              <h3 style={{ margin: '0 0 0.5rem 0' }}>How can I help you today?</h3>
              <p style={{ fontSize: '0.9rem', margin: 0 }}>Ask me about the menu, recommendations,<br />or just have a chat!</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className="animate-fade-in"
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  display: 'flex',
                  gap: '0.7rem',
                  maxWidth: '80%',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-end'
                }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: msg.role === 'user' ? 'var(--primary-color)' : 'rgba(76, 175, 80, 0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {msg.role === 'user' ? <UserIcon size={16} color="var(--bg-color)" /> : <Bot size={16} color="#4caf50" />}
                </div>
                <div style={{
                  background: msg.role === 'user' ? 'var(--primary-color)' : 'var(--bg-card)',
                  color: msg.role === 'user' ? 'var(--bg-color)' : 'var(--text-main)',
                  padding: '0.75rem 1.1rem',
                  borderRadius: '18px',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '18px',
                  borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '18px',
                  border: msg.role === 'ai' ? '1px solid var(--border-color)' : 'none',
                  fontSize: '0.95rem',
                  lineHeight: '1.55',
                  whiteSpace: 'pre-wrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {msg.text}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.7rem', alignItems: 'flex-end' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(76, 175, 80, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={16} color="#4caf50" />
              </div>
              <div style={{ padding: '0.85rem 1.2rem', borderRadius: '18px', borderBottomLeftRadius: '4px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf50', animation: 'bounce 1s infinite' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf50', animation: 'bounce 1s 0.2s infinite' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf50', animation: 'bounce 1s 0.4s infinite' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(212, 163, 115, 0.15)' }}>
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send)"
            rows={1}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '0.9rem 1.2rem',
              borderRadius: '25px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-input)',
              color: 'var(--text-main)',
              fontSize: '0.95rem',
              outline: 'none',
              resize: 'none',
              maxHeight: '120px',
              overflowY: 'auto',
              lineHeight: '1.4'
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !chatInput.trim()}
            style={{
              width: '48px', height: '48px',
              borderRadius: '50%',
              border: 'none',
              background: chatInput.trim() && !isLoading ? 'var(--primary-color)' : 'rgba(212, 163, 115, 0.2)',
              color: chatInput.trim() && !isLoading ? 'var(--bg-color)' : 'var(--text-muted)',
              cursor: chatInput.trim() && !isLoading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              alignSelf: 'flex-end',
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} style={{ marginLeft: '2px' }} />}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

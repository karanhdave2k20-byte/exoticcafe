import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { useStore } from '../StoreContext';

export default function Chatbot() {
  const { showToast } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! Welcome to TableHive. ☕ How can I assist you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate Bot Response
    setTimeout(() => {
      let botResponse = "I'm not sure about that. Try asking about our hours, best sellers, reservation system, or loyalty points!";
      const query = input.toLowerCase();

      if (query.includes('hour') || query.includes('time') || query.includes('open')) {
        botResponse = "We are open every single day from 8:00 AM to 11:00 PM. We hope to see you soon! ☀️";
      } else if (query.includes('best') || query.includes('popular') || query.includes('recommend')) {
        botResponse = "Our absolute best sellers are the Golden Cappuccino, Double Cheese Crunch Burger, and our classic Margherita Pizza! 😋";
      } else if (query.includes('book') || query.includes('reserve') || query.includes('table')) {
        botResponse = "You can book a table by navigating to the 'Book Table' option on the top navigation bar.";
      } else if (query.includes('loyalty') || query.includes('point')) {
        botResponse = "For every ₹100 you spend, you earn 10 Loyalty Points! You can redeem points during order placement.";
      } else if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
        botResponse = "Hello there! How can I help you choose your coffee or meal today? ☕";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
    }, 800);
  };

  return (
    <div className="chatbot-container">
      {/* Toggle button */}
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chatbot window */}
      {isOpen && (
        <div className="chatbot-window glass-panel" style={{
          background: 'var(--bg-card)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            background: 'var(--primary-color)',
            color: '#121212',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 'bold'
          }}>
            <Bot size={20} />
            <span>Café Virtual Assistant</span>
          </div>

          {/* Messages list */}
          <div style={{
            flex: 1,
            padding: '1rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem'
          }}>
            {messages.map(m => (
              <div key={m.id} style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                background: m.sender === 'user' ? 'var(--primary-color)' : 'var(--bg-card-hover)',
                color: m.sender === 'user' ? '#121212' : 'var(--text-main)',
                padding: '0.6rem 0.8rem',
                borderRadius: m.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                maxWidth: '80%',
                fontSize: '0.85rem',
                lineHeight: '1.4',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {m.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSend} style={{
            padding: '0.8rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <input 
              type="text" 
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem 0.8rem',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                background: 'var(--bg-color)'
              }}
            />
            <button type="submit" className="btn btn-primary" style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

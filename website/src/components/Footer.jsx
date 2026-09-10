import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Instagram, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { useStore } from '../StoreContext';

export default function Footer() {
  const { showToast } = useStore();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      showToast('Thank you for subscribing to our newsletter! ☕', 'success');
      setEmail('');
    }
  };

  return (
    <footer style={{
      background: 'rgba(20, 26, 17, 0.95)',
      borderTop: '1px solid var(--border-color)',
      padding: '3rem 2rem 1.5rem 2rem',
      color: 'var(--text-main)',
      fontSize: '0.9rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        
        {/* Brand Section */}
        <div>
          <h3 style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '1rem' }}>TableHive</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.2rem' }}>
            Experience the divine taste of our premium artisanal coffee and gourmet snacks, crafted fresh daily.
          </p>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <a href="https://instagram.com" className="btn-icon" style={{ width: '36px', height: '36px' }}><Instagram size={18} /></a>
            <a href="https://facebook.com" className="btn-icon" style={{ width: '36px', height: '36px' }}><Facebook size={18} /></a>
            <a href="https://twitter.com" className="btn-icon" style={{ width: '36px', height: '36px' }}><Twitter size={18} /></a>
            <a href="https://wa.me/911234567890" className="btn-icon" style={{ width: '36px', height: '36px' }}><MessageCircle size={18} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem', fontWeight: 600 }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <li><Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link></li>
            <li><Link to="/menu" style={{ color: 'var(--text-muted)' }}>Menu</Link></li>
            <li><Link to="/preference" style={{ color: 'var(--text-muted)' }}>Book a Table</Link></li>
            <li><Link to="/about" style={{ color: 'var(--text-muted)' }}>About Us</Link></li>
            <li><Link to="/contact" style={{ color: 'var(--text-muted)' }}>Contact Us</Link></li>
            <li><Link to="/media-suggest" style={{ color: 'var(--text-muted)' }}>Entertainment</Link></li>
          </ul>
        </div>

        {/* Support & Legal */}
        <div>
          <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem', fontWeight: 600 }}>Legal</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <li><a href="#" style={{ color: 'var(--text-muted)' }}>Privacy Policy</a></li>
            <li><a href="#" style={{ color: 'var(--text-muted)' }}>Terms of Service</a></li>
            <li><a href="#" style={{ color: 'var(--text-muted)' }}>Refund Policy</a></li>
            <li><a href="#" style={{ color: 'var(--text-muted)' }}>Contact Support</a></li>
          </ul>
        </div>

        {/* Newsletter Sign Up */}
        <div>
          <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem', fontWeight: 600 }}>Newsletter</h4>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Subscribe to receive sweet discounts and updates on new premium coffee blends.
          </p>
          <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="email" 
              placeholder="Your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1,
                padding: '0.6rem 1rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem'
              }}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1rem' }}>
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Footer Bottom */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        paddingTop: '1.5rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8rem'
      }}>
        <p>&copy; {new Date().getFullYear()} TableHive. All Rights Reserved. Built with ❤️ for coffee lovers.</p>
      </div>
    </footer>
  );
}

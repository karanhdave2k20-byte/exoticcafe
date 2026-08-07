import React from 'react';
import { Mail, Phone, Clock, MapPin, Instagram, MessageCircle, Facebook, Send } from 'lucide-react';
import { useStore } from '../../StoreContext';
import WebsiteNavbar from '../../components/WebsiteNavbar';
import Footer from '../../components/Footer';

export default function Contact() {
  const { showToast } = useStore();

  const handleMessage = (e) => {
    e.preventDefault();
    showToast('Your message has been received! We will respond shortly.', 'success');
    e.target.reset();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', display: 'flex', flexDirection: 'column' }}>
      <WebsiteNavbar />

      <main style={{ flex: 1, maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        
        {/* Header Title */}
        <section style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(200, 161, 101, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <MessageCircle size={36} color="var(--primary-color)" />
          </div>
          <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-color)', margin: '0 0 1rem 0' }}>
            Contact Us
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            We'd love to hear from you! Drop a line for feedback, catering events, or private reservations.
          </p>
        </section>

        {/* Contact Info & Form */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          
          {/* Info Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-color)', margin: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>Café Info</h3>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <MapPin size={20} color="var(--primary-color)" style={{ marginTop: '0.2rem' }} />
                <div>
                  <strong>Address:</strong>
                  <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>123 Coffee Roasters Way, Downtown, NY</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <Clock size={20} color="var(--primary-color)" style={{ marginTop: '0.2rem' }} />
                <div>
                  <strong>Opening Hours:</strong>
                  <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Monday - Sunday: 8:00 AM - 11:00 PM</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <Phone size={20} color="var(--primary-color)" style={{ marginTop: '0.2rem' }} />
                <div>
                  <strong>Phone / WhatsApp:</strong>
                  <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>+1 (555) 321-4567 / +1 (555) 765-4321</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <Mail size={20} color="var(--primary-color)" style={{ marginTop: '0.2rem' }} />
                <div>
                  <strong>Email:</strong>
                  <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>hello@exoticcafe.com</p>
                </div>
              </div>
            </div>

            {/* Social widgets */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-around' }}>
              <a href="https://wa.me/15557654321" className="btn-icon" style={{ width: '48px', height: '48px' }}><MessageCircle size={22} color="#25D366" /></a>
              <a href="https://instagram.com" className="btn-icon" style={{ width: '48px', height: '48px' }}><Instagram size={22} color="#E1306C" /></a>
              <a href="https://facebook.com" className="btn-icon" style={{ width: '48px', height: '48px' }}><Facebook size={22} color="#1877F2" /></a>
            </div>
          </div>

          {/* Form */}
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Send Message</h3>
            <form onSubmit={handleMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <input type="text" placeholder="Your Name" required style={{ background: 'var(--bg-card-hover)', border: 'none' }} />
              <input type="email" placeholder="Your Email" required style={{ background: 'var(--bg-card-hover)', border: 'none' }} />
              <textarea placeholder="Your Message" rows={5} required style={{ background: 'var(--bg-card-hover)', color: 'var(--text-main)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.8rem', resize: 'none', width: '100%' }} />
              <button type="submit" className="btn btn-primary btn-block" style={{ padding: '1rem', gap: '0.6rem' }}>
                Send <Send size={16} />
              </button>
            </form>
          </div>

        </section>

        {/* Mock Map View */}
        <section className="glass-panel" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <div style={{ height: '300px', width: '100%', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            <MapPin size={40} color="var(--primary-color)" />
            <h4 style={{ margin: 0 }}>Interactive Google Map Integration</h4>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Click below to navigate directly on Google Maps</p>
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}>
              Open in Maps
            </a>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

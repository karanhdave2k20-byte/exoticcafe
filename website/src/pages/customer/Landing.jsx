import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, ArrowRight, Download, Smartphone, QrCode, 
  MapPin, Clock, Star, MessageSquare, Instagram, Phone, Coffee, ChevronDown 
} from 'lucide-react';
import { useStore } from '../../StoreContext';
import WebsiteNavbar from '../../components/WebsiteNavbar';
import Footer from '../../components/Footer';

export default function Landing() {
  const navigate = useNavigate();
  const { showToast, mockMenu } = useStore();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  
  // Lightbox State
  const [activeImage, setActiveImage] = useState(null);

  // Gallery Images
  const galleryImages = [
    '/espresso.png',
    '/latte.png',
    '/croissant.png',
    '/cheesecake.png',
  ];

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      showToast("App is ready to install!", "info");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [showToast]);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        showToast("Welcome to the standalone app!", "success");
      }
    } else {
       showToast("To install, use your browser's 'Add to Home Screen' option.", "info");
    }
  };



  const scrollToBooking = () => {
    document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Hero Wrapper containing Navbar and Header for seamless background image matching */}
      <div style={{ 
        backgroundImage: 'url(/hero_coffee_bg.png)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        {/* Dark overlay simulation for the entire hero area */}
        <div className="video-bg-overlay" style={{ zIndex: 0 }} />

        {/* 2. Navbar */}
        <WebsiteNavbar />

        {/* Hero Section with video/dynamic overlay & floating beans */}
        <header style={{ 
          position: 'relative', 
          zIndex: 1,
          minHeight: '88vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          textAlign: 'center', 
          padding: '2.5rem 2rem 5rem 2rem',
          overflow: 'hidden'
        }}>
          {/* Floating beans animation */}
          <Coffee className="floating-bean" style={{ top: '15%', left: '10%', width: '40px', height: '40px', animationDelay: '0s' }} />
          <Coffee className="floating-bean" style={{ top: '40%', right: '15%', width: '30px', height: '30px', animationDelay: '2s' }} />
          <Coffee className="floating-bean" style={{ bottom: '25%', left: '20%', width: '35px', height: '35px', animationDelay: '4s' }} />

          {/* Hero Content */}
          <div style={{ zIndex: 1, maxWidth: '800px' }} className="animate-fade-in">
            {/* Offer Banner */}
            <div style={{ display: 'inline-flex', background: 'rgba(212, 163, 115, 0.2)', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1.5rem', letterSpacing: '1px' }}>
              ⚡ SPECIAL OFFER: USE CODE "EXOTIC20" FOR 20% OFF!
            </div>

            {/* Coffee Steam Animation */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '0.5rem', height: '24px' }}>
              <span className="steam-line" style={{ animationDelay: '0s' }}></span>
              <span className="steam-line" style={{ animationDelay: '0.4s' }}></span>
              <span className="steam-line" style={{ animationDelay: '0.2s' }}></span>
            </div>

            {/* 1. Strong Headline */}
            <h1 style={{ fontSize: '3.3rem', color: 'var(--primary-color)', fontFamily: 'var(--font-serif)', marginBottom: '1.2rem', lineHeight: '1.2' }}>
              Freshly Brewed Coffee, <span style={{ display: 'block', fontSize: '2.4rem', color: 'var(--text-main)' }}>Every Cup Tells a Story. ☕</span>
            </h1>
            <p style={{ color: 'var(--text-main)', fontSize: '1.2rem', opacity: 0.9, marginBottom: '2.5rem', fontFamily: 'var(--font-sans)', fontWeight: 300 }}>
              Experience divine taste and premium artisanal blends crafted with pure organic beans.
            </p>

            {/* Quick info row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '2.5rem', opacity: 0.8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Star size={16} fill="var(--primary-color)" color="var(--primary-color)" /> 4.9 Rating (1,200+ Reviews)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} color="var(--primary-color)" /> 8:00 AM - 11:00 PM
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} color="var(--primary-color)" /> Downtown Café Street
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '6rem' }}>
              <button className="btn btn-primary" onClick={() => navigate('/menu')} style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                Order Now <ArrowRight size={20} />
              </button>
              <button className="btn btn-outline" onClick={scrollToBooking} style={{ padding: '1rem 2rem', fontSize: '1.1rem', color: 'white', borderColor: 'white' }}>
                Book Table
              </button>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="scroll-indicator" onClick={scrollToBooking}>
            <span>Select Table</span>
            <ChevronDown size={20} />
          </div>
        </header>
      </div>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', gap: '5rem' }}>
        
        {/* Table Selection / QR Section */}
        <section id="booking-section" className="glass-panel" style={{ padding: '3.5rem 2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--primary-color)', marginBottom: '1.2rem', fontFamily: 'var(--font-serif)' }}>Seamless Table Ordering</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.7', fontSize: '1.05rem' }}>
              At Exotic Café, we've revolutionized dining. Scan the unique QR code on your table to instantly join a collaborative ordering session with your table mates, call the waiter, play games, and split the bill.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-primary" onClick={() => navigate('/menu')} style={{ flex: 1, padding: '1rem' }}>
                Browse Preview Menu
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ padding: '16px', background: 'white', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://exotic-cafe.com" 
                alt="Demo Table QR" 
                style={{ width: '180px', height: '180px', display: 'block', margin: '0 auto' }} 
              />
              <span style={{ display: 'block', color: '#1a1a1a', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '0.8rem', letterSpacing: '1px' }}>
                SCAN TABLE QR AT CAFÉ
              </span>
            </div>
          </div>
        </section>

        {/* Featured Coffee Highlights */}
        <section>
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', color: 'var(--primary-color)', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Featured Art Blend</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '3rem' }}>Indulge in our masterfully selected highlights</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {mockMenu.slice(0, 3).map(item => (
              <div key={item.id} className="glass-panel product-card-premium" style={{ padding: '1.2rem', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
                {item.discount > 0 && <span className="discount-badge">{item.discount}% OFF</span>}
                <div style={{ height: '200px', width: '100%', overflow: 'hidden', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                  <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.5s' }} />
                </div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{item.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', flex: 1 }}>{item.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{item.price}</span>
                  <button className="btn btn-primary" onClick={() => navigate('/menu')} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    View Menu
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Immersive About / Story Timeline Section */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <div style={{ order: 2 }}>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Our Café Story</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
              Established in 2026, Exotic Café started with a simple vision: to create an oasis for coffee lovers where divine taste meets modern convenience. 
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '2rem' }}>
              We source single-origin specialty beans from high-altitude estates globally, roasting them precisely in-house to unlock unique, chocolatey, and floral flavor notes.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/menu')}>Explore Menu</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', order: 1 }}>
            <div style={{ borderLeft: '3px solid var(--primary-color)', paddingLeft: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-8px', top: '0', width: '13px', height: '13px', borderRadius: '50%', background: 'var(--primary-color)' }} />
              <h4 style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '1.1rem' }}>2024 - Finding the Beans</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Traveled globally to establish direct-trade agreements with organic coffee farmers.</p>
            </div>
            <div style={{ borderLeft: '3px solid var(--primary-color)', paddingLeft: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-8px', top: '0', width: '13px', height: '13px', borderRadius: '50%', background: 'var(--primary-color)' }} />
              <h4 style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '1.1rem' }}>2025 - Crafting the Roastery</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Launched our micro-roastery facilities with state-of-the-art temperature controlled profiling.</p>
            </div>
            <div style={{ borderLeft: '3px solid var(--primary-color)', paddingLeft: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-8px', top: '0', width: '13px', height: '13px', borderRadius: '50%', background: 'var(--primary-color)' }} />
              <h4 style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '1.1rem' }}>2026 - Digital ordering Oasis</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Opened the physical café equipped with QR-based instant ordering and waiter assistance.</p>
            </div>
          </div>
        </section>

        {/* Gallery Grid with Lightbox */}
        <section>
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', color: 'var(--primary-color)', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Café Gallery</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '3rem' }}>Take a visual tour around our space</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {galleryImages.map((src, index) => (
              <div 
                key={index} 
                onClick={() => setActiveImage(src)}
                style={{ height: '220px', borderRadius: 'var(--radius-md)', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'var(--shadow-sm)' }}
              >
                <img 
                  src={src} 
                  alt={`Gallery ${index}`} 
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.3s' }} 
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form & Google Map */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
          <div>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Contact & Find Us</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              <p>Feel free to reach out for events, reservations, or general queries.</p>
              <div>
                <strong>📍 Address:</strong>
                <p>123 Coffee Roasters Way, Downtown, NY</p>
              </div>
              <div>
                <strong>📞 Phone / WhatsApp:</strong>
                <p>+1 (555) 321-4567 / +1 (555) 765-4321</p>
              </div>
              <div>
                <strong>✉️ Email:</strong>
                <p>hello@exoticcafe.com</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <a href="https://wa.me/15557654321" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>WhatsApp</a>
                <a href="https://instagram.com" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Instagram</a>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '1.2rem' }}>Drop us a message</h4>
            <form onSubmit={(e) => { e.preventDefault(); showToast('Message sent successfully! We will write back soon.', 'success'); e.target.reset(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Your Name" required />
              <input type="email" placeholder="Your Email" required />
              <textarea placeholder="Your Message" rows={4} required style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.8rem', resize: 'none' }} />
              <button type="submit" className="btn btn-primary">Send Message</button>
            </form>
          </div>
        </section>

      </main>

      {/* Lightbox Component */}
      {activeImage && (
        <div 
          onClick={() => setActiveImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <img 
            src={activeImage} 
            alt="Lightbox Preview" 
            style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }} 
          />
        </div>
      )}

      {/* 11. Footer */}
      <Footer />
    </div>
  );
}

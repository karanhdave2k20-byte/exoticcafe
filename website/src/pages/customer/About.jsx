import React from 'react';
import { Sparkles, Heart, Users, Award, BookOpen } from 'lucide-react';
import WebsiteNavbar from '../../components/WebsiteNavbar';
import Footer from '../../components/Footer';

export default function About() {
  const chefs = [
    { name: 'Chef Alessandro Rossi', role: 'Head Barista & Roaster Master', desc: 'Over 15 years sourcing and roasting artisanal coffee globally.', img: 'https://ui-avatars.com/api/?name=Alessandro+Rossi&background=C8A165&color=1e3a2f' },
    { name: 'Chef Sofia Laurent', role: 'Pastry Chef extraordinaire', desc: 'Crafts our signature golden croissants and fudge brownies daily.', img: 'https://ui-avatars.com/api/?name=Sofia+Laurent&background=C8A165&color=1e3a2f' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', display: 'flex', flexDirection: 'column' }}>
      <WebsiteNavbar />

      <main style={{ flex: 1, maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        
        {/* Header Title */}
        <section style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(200, 161, 101, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <Award size={36} color="var(--primary-color)" />
          </div>
          <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-color)', margin: '0 0 1rem 0' }}>
            About TableHive
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Brewing perfection daily since 2026. Every bean tells a story of sustainability and rich artisanal roasting.
          </p>
        </section>

        {/* Story Section */}
        <section className="glass-panel" style={{ padding: '3rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '1.2rem', fontFamily: 'var(--font-serif)' }}>Our Story</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '1.2rem' }}>
              TableHive was born from a desire to escape the commercial rush and return to the simple pleasure of slow-drip, perfectly-roasted specialty coffee. 
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
              We source directly from eco-friendly Arabica and Robusta plantations in Ethiopia, Colombia, and Sumatra, paying fair trade wages to secure the top 1% harvest.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Sparkles size={16} /> Mission</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>To deliver an outstanding sensory coffee experience while fostering community.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Heart size={16} /> Vision</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>To set the gold standard in coffee craftsmanship and carbon-neutral roasting processes.</p>
            </div>
          </div>
        </section>

        {/* Chefs / Team */}
        <section>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--primary-color)', marginBottom: '2.5rem', textAlign: 'center', fontFamily: 'var(--font-serif)' }}>Our Masters of Taste</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {chefs.map((chef, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src={chef.img} alt={chef.name} style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1.5rem', border: '2px solid var(--primary-color)' }} />
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>{chef.name}</h3>
                <p style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1rem' }}>{chef.role}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>{chef.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--primary-color)', marginBottom: '2.5rem', textAlign: 'center', fontFamily: 'var(--font-serif)' }}>Timeline of Craft</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
            <div style={{ borderLeft: '3px solid var(--primary-color)', paddingLeft: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-8px', top: '0', width: '13px', height: '13px', borderRadius: '50%', background: 'var(--primary-color)' }} />
              <h4 style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '1.1rem' }}>2024 - Journey of Discovery</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Sourcing partner estates in Colombia & Ethiopia.</p>
            </div>
            <div style={{ borderLeft: '3px solid var(--primary-color)', paddingLeft: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-8px', top: '0', width: '13px', height: '13px', borderRadius: '50%', background: 'var(--primary-color)' }} />
              <h4 style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '1.1rem' }}>2025 - Designing Roastery</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Established our clean energy roasting house.</p>
            </div>
            <div style={{ borderLeft: '3px solid var(--primary-color)', paddingLeft: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-8px', top: '0', width: '13px', height: '13px', borderRadius: '50%', background: 'var(--primary-color)' }} />
              <h4 style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '1.1rem' }}>2026 - Coffee Oasis Launch</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Opened the brick-and-mortar hub in downtown.</p>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

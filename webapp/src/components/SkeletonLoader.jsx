import React from 'react';

export default function SkeletonLoader({ type = 'card' }) {
  if (type === 'card') {
    return (
      <div className="glass-panel skeleton-pulse" style={{ height: '320px', display: 'flex', flexDirection: 'column', padding: '1rem', gap: '1rem' }}>
        <div className="skeleton-pulse" style={{ height: '180px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton-pulse" style={{ height: '24px', width: '70%', background: 'rgba(255,255,255,0.05)' }} />
        <div className="skeleton-pulse" style={{ height: '16px', width: '90%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div className="skeleton-pulse" style={{ height: '24px', width: '30%', background: 'rgba(255,255,255,0.05)' }} />
          <div className="skeleton-pulse" style={{ height: '36px', width: '40%', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.05)' }} />
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="skeleton-pulse" style={{ height: '50px', width: '100%', display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', gap: '1rem', background: 'rgba(255,255,255,0.03)' }}>
        <div className="skeleton-pulse" style={{ height: '20px', width: '10%', background: 'rgba(255,255,255,0.05)' }} />
        <div className="skeleton-pulse" style={{ height: '20px', width: '40%', background: 'rgba(255,255,255,0.05)' }} />
        <div className="skeleton-pulse" style={{ height: '20px', width: '20%', background: 'rgba(255,255,255,0.05)' }} />
        <div className="skeleton-pulse" style={{ height: '20px', width: '30%', background: 'rgba(255,255,255,0.05)' }} />
      </div>
    );
  }

  return (
    <div className="skeleton-pulse" style={{ height: '100px', width: '100%', borderRadius: 'var(--radius-md)' }} />
  );
}

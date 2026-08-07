import React from 'react';
import { QrCode, LogIn, Users, Share2, Sparkles } from 'lucide-react';

export default function OnboardingStepper({ currentStep = 1 }) {
  const steps = [
    { id: 1, label: 'QR Scan', icon: QrCode },
    { id: 2, label: 'Login', icon: LogIn },
    { id: 3, label: 'Group', icon: Users },
    { id: 4, label: 'Invite', icon: Share2 },
    { id: 5, label: 'Vibes', icon: Sparkles },
  ];

  return (
    <div style={{
      maxWidth: '500px',
      width: '100%',
      margin: '1.2rem auto',
      padding: '0.8rem 0.5rem',
      borderRadius: '16px',
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      fontFamily: 'var(--font-sans)',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        {/* Connecting Line */}
        <div style={{
          position: 'absolute',
          top: '17px',
          left: '8%',
          right: '8%',
          height: '2px',
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 1
        }}>
          <div style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            height: '100%',
            background: 'var(--primary-color)',
            transition: 'width 0.4s ease',
            boxShadow: '0 0 8px var(--primary-color)'
          }} />
        </div>

        {/* Steps */}
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;

          return (
            <div key={step.id} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 2,
              flex: 1
            }}>
              {/* Step Circle */}
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isCompleted 
                  ? 'var(--primary-color)' 
                  : isActive 
                    ? 'var(--bg-card)' 
                    : 'var(--bg-color)',
                color: isCompleted 
                  ? '#121212' 
                  : isActive 
                    ? 'var(--primary-color)' 
                    : 'var(--text-muted)',
                border: isActive 
                  ? '2px solid var(--primary-color)' 
                  : '2px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isActive ? '0 0 12px rgba(212, 163, 115, 0.35)' : 'none',
                transition: 'all 0.3s ease',
                cursor: 'default'
              }}>
                <Icon size={15} />
              </div>

              {/* Step Label */}
              <span style={{
                fontSize: '0.65rem',
                marginTop: '0.4rem',
                fontWeight: isActive ? 'bold' : 'normal',
                color: isActive 
                  ? 'var(--primary-color)' 
                  : isCompleted 
                    ? 'var(--text-main)' 
                    : 'var(--text-muted)',
                transition: 'color 0.3s ease',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

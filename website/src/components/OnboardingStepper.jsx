import React from 'react';
import { QrCode, LogIn, Users, Sparkles } from 'lucide-react';

export default function OnboardingStepper({ currentStep = 1 }) {
  const steps = [
    { id: 1, label: 'Table QR', icon: QrCode },
    { id: 2, label: 'Login', icon: LogIn },
    { id: 3, label: 'Guests', icon: Users },
    { id: 4, label: 'Preferences', icon: Sparkles },
  ];

  return (
    <div style={{
      maxWidth: '500px',
      margin: '1.5rem auto',
      padding: '1rem',
      borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(10px)',
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
          top: '20px',
          left: '10%',
          right: '10%',
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
                width: '42px',
                height: '42px',
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
                boxShadow: isActive ? '0 0 15px rgba(212, 163, 115, 0.4)' : 'none',
                transition: 'all 0.3s ease',
                cursor: 'default'
              }}>
                <Icon size={18} />
              </div>

              {/* Step Label */}
              <span style={{
                fontSize: '0.75rem',
                marginTop: '0.5rem',
                fontWeight: isActive ? 'bold' : 'normal',
                color: isActive 
                  ? 'var(--primary-color)' 
                  : isCompleted 
                    ? 'var(--text-main)' 
                    : 'var(--text-muted)',
                transition: 'color 0.3s ease'
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

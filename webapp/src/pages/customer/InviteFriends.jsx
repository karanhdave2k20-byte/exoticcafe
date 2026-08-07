import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Share2, UserPlus, X, Copy, Check, Mail, Phone
} from 'lucide-react';
import { useStore } from '../../StoreContext';
import OnboardingStepper from '../../components/OnboardingStepper';
import WebAppHeader from '../../components/WebAppHeader';

export default function InviteFriends() {
  const navigate = useNavigate();
  const { tableInfo, showToast, serverIp, tunnelUrl } = useStore();

  const tableNo = tableInfo?.tableNo;
  
  // Construct a route accessible from other devices (Wi-Fi IP or Public Tunnel URL)
  const host = tunnelUrl && tunnelUrl.startsWith('http')
    ? tunnelUrl
    : serverIp && serverIp !== 'localhost' && serverIp !== '127.0.0.1'
      ? `http://${serverIp}:${window.location.port || '5174'}`
      : window.location.origin;

  const tableUrl = tableNo
    ? `${host}/table/${tableNo}?invite=true`
    : host;

  const [contacts, setContacts] = useState(['']);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleContactChange = (index, value) => {
    const updated = [...contacts];
    updated[index] = value;
    setContacts(updated);
  };

  const addContactField = () => {
    if (contacts.length < 6) {
      setContacts([...contacts, '']);
    }
  };

  const removeContactField = (index) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tableUrl).then(() => {
      setCopied(true);
      showToast('Table link copied! Share it with your friends. 🔗', 'success');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleSendInvites = async () => {
    const validContacts = contacts.filter(c => c.trim() !== '');
    if (validContacts.length === 0) {
      showToast('Add at least one email or phone number to invite friends.', 'error');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNo, contacts: validContacts, tableUrl }),
      });

      // Copy link to clipboard for convenience
      try {
        await navigator.clipboard.writeText(tableUrl);
      } catch (e) {
        console.warn("Clipboard access denied");
      }

      if (response.ok) {
        const data = await response.json();
        if (data.fallback) {
          showToast(`Invites simulated! Link copied to clipboard. 🔗`, 'success');
        } else {
          showToast(`Email invites sent successfully! 📬`, 'success');
        }
      } else {
        showToast(`Table link copied! Share it with your friends. 🔗`, 'success');
      }
    } catch (err) {
      showToast(`Table link copied! Share it with your friends. 🔗`, 'success');
    } finally {
      setIsSending(false);
      navigate('/preference');
    }
  };

  const handleSkip = () => {
    navigate('/preference');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingBottom: '4rem' }}>
      <WebAppHeader />

      {tableNo && (
        <div style={{ padding: '1rem 1.5rem 0 1.5rem' }}>
          <OnboardingStepper currentStep={4} />
        </div>
      )}

      <div style={{ maxWidth: '480px', margin: '2rem auto 0 auto', padding: '0 1.5rem' }}>

      {/* Header */}
      <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
        <div
          style={{
            display: 'inline-flex',
            background: 'rgba(212, 163, 115, 0.12)',
            padding: '1rem',
            borderRadius: '50%',
            marginBottom: '1rem',
          }}
        >
          <Share2 size={36} color="var(--primary-color)" />
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2rem',
            color: 'var(--primary-color)',
            margin: '0 0 0.4rem 0',
          }}
        >
          Invite Your Group
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
          Share the table with friends so they can order too — at their own pace.
        </p>
      </div>

      {/* QR Code Card */}
      {tableNo && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            padding: '1.5rem',
            borderRadius: '20px',
            border: '1px solid rgba(212, 163, 115, 0.25)',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Table {tableNo} — Share QR
          </p>
          <div
            style={{
              background: 'white',
              padding: '10px',
              borderRadius: '12px',
              display: 'inline-block',
              marginBottom: '1rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(tableUrl)}`}
              alt={`Table ${tableNo} invite QR`}
              style={{ width: '160px', height: '160px', display: 'block' }}
            />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem' }}>
            Friends scan this to join your table session.
          </p>

          {/* Copy Link Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(212, 163, 115, 0.15)',
              borderRadius: '10px',
              padding: '0.6rem 0.8rem',
            }}
          >
            <span
              style={{
                flex: 1,
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {tableUrl}
            </span>
            <button
              onClick={handleCopyLink}
              style={{
                background: copied ? 'rgba(76,175,80,0.15)' : 'rgba(212, 163, 115, 0.15)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.4rem 0.8rem',
                color: copied ? '#4caf50' : 'var(--primary-color)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Email / Phone Invite Inputs */}
      <div
        className="glass-panel animate-fade-in"
        style={{
          padding: '1.5rem',
          borderRadius: '20px',
          border: '1px solid rgba(212, 163, 115, 0.2)',
          marginBottom: '1.5rem',
          flex: 1,
        }}
      >
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginBottom: '1.2rem',
          }}
        >
          Send Invite Link
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {contacts.map((contact, index) => (
            <div key={index} style={{ position: 'relative' }}>
              {contact.includes('@') || contact === '' ? (
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    top: '14px',
                    left: '14px',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
              ) : (
                <Phone
                  size={16}
                  style={{
                    position: 'absolute',
                    top: '14px',
                    left: '14px',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
              )}
              <input
                type="text"
                placeholder={index === 0 ? 'Email or phone number' : `Friend ${index + 1} — email or phone`}
                value={contact}
                onChange={(e) => handleContactChange(index, e.target.value)}
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  paddingLeft: '3rem',
                  paddingRight: contacts.length > 1 ? '3rem' : '1rem',
                  borderRadius: '10px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                }}
              />
              {contacts.length > 1 && (
                <button
                  onClick={() => removeContactField(index)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        {contacts.length < 6 && (
          <button
            onClick={addContactField}
            style={{
              marginTop: '1rem',
              background: 'transparent',
              border: '1px dashed rgba(212, 163, 115, 0.35)',
              borderRadius: '10px',
              width: '100%',
              padding: '0.75rem',
              color: 'var(--primary-color)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              transition: 'border-color 0.2s ease',
            }}
          >
            <UserPlus size={16} /> Add Another Friend
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', paddingBottom: '1rem' }}>
        <button
          onClick={handleSendInvites}
          disabled={isSending}
          className="btn btn-primary btn-block"
          style={{
            padding: '1.1rem',
            fontSize: '1.05rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.7rem',
            boxShadow: '0 10px 30px rgba(212, 163, 115, 0.35)',
          }}
        >
          {isSending ? 'Sending...' : <><span>Send Invites</span> <ArrowRight size={20} /></>}
        </button>

        <button
          onClick={handleSkip}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            padding: '0.6rem',
            textDecoration: 'underline',
          }}
        >
          Skip for now — go straight to seating preferences
        </button>
      </div>

      </div>
    </div>
  );
}

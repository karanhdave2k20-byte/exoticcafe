import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Banknote, CreditCard, ChevronRight, CheckCircle2, MapPin, Phone, Clock, ShoppingBag } from 'lucide-react';
import { useStore } from '../../StoreContext';
import Navbar from '../../components/Navbar';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tableInfo, showToast, placeOrder, setTableInfo, setUser, setCart } = useStore();

  const checkoutState = location.state || {
    subtotal: 0,
    gst: 0,
    delivery: 0,
    discount: 0,
    total: 0,
    promoCode: ''
  };

  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!phoneNumber) {
      showToast('Please enter your contact phone number.', 'error');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate API Call
    setTimeout(async () => {
      try {
        // Place the order in the context/database
        await placeOrder();

        // Push payment details to the database
        await fetch(`/api/database/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: Math.floor(Math.random()*90000000).toString(), 
            rel: tableInfo?.tableNo ? `Table ${tableInfo.tableNo}` : 'Takeaway',
            method: selectedMethod, 
            status: 'Success', 
            amount: `₹${checkoutState.total.toFixed(2)}` 
          })
        });

        // Set state to success
        setSuccess(true);
        setIsProcessing(false);

        // Redirect to Suggestion/Films page after success animation
        setTimeout(() => {
          navigate('/suggest');
        }, 2500);

      } catch (err) {
        console.error(err);
        setIsProcessing(false);
      }
    }, 1500);
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-color)', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: 'var(--success-color)', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', boxShadow: 'var(--shadow-glow)' }}>
            <svg className="success-svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#121212" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17L4 12" />
            </svg>
          </div>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--success-color)', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Payment Successful!</h2>
          <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Order placed and sent to the kitchen.</p>
          <p style={{ color: 'var(--text-muted)' }}>Estimated serving time: 15–20 minutes.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingBottom: '4rem' }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', marginBottom: '2rem', textAlign: 'center', color: 'var(--primary-color)' }}>
          Checkout & Payment
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          {/* Checkout inputs Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <form onSubmit={handlePay} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-color)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={20} /> Serving Details
              </h3>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Phone Number:</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--text-muted)' }} />
                  <input 
                    type="tel" 
                    placeholder="Enter phone number" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    style={{ paddingLeft: '3rem' }}
                    required 
                  />
                </div>
              </div>

              {!tableInfo?.tableNo ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Delivery Address:</label>
                  <textarea 
                    placeholder="Enter full delivery address" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.8rem', resize: 'none', width: '100%' }}
                    required 
                  />
                </div>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    📍 Ordering directly to <b>Table Number {tableInfo.tableNo}</b>
                  </p>
                </div>
              )}

              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-color)', marginTop: '1rem', marginBottom: '0.5rem' }}>
                Payment Method
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', padding: '0.8rem', background: selectedMethod === 'UPI' ? 'rgba(212,163,115,0.1)' : 'transparent', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <input type="radio" name="payment" value="UPI" checked={selectedMethod === 'UPI'} onChange={() => setSelectedMethod('UPI')} />
                  <Banknote size={20} color="var(--primary-color)" />
                  <div>
                    <strong>UPI / Online Payment</strong>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>GPay, PhonePe, Paytm</p>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', padding: '0.8rem', background: selectedMethod === 'Card' ? 'rgba(212,163,115,0.1)' : 'transparent', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <input type="radio" name="payment" value="Card" checked={selectedMethod === 'Card'} onChange={() => setSelectedMethod('Card')} />
                  <CreditCard size={20} color="var(--primary-color)" />
                  <div>
                    <strong>Credit / Debit Card</strong>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Visa, MasterCard, RuPay</p>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', padding: '0.8rem', background: selectedMethod === 'Cash' ? 'rgba(212,163,115,0.1)' : 'transparent', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <input type="radio" name="payment" value="Cash" checked={selectedMethod === 'Cash'} onChange={() => setSelectedMethod('Cash')} />
                  <CreditCard size={20} color="var(--primary-color)" />
                  <div>
                    <strong>Pay at Counter / Cash</strong>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cash or card at counter</p>
                  </div>
                </label>
              </div>

              <button type="submit" disabled={isProcessing} className="btn btn-primary btn-block" style={{ marginTop: '1rem', padding: '1.2rem' }}>
                {isProcessing ? 'Processing Payment...' : `Pay ₹${checkoutState.total.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Checkout Order Summary Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-color)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingBag size={20} /> Order Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span>₹{checkoutState.subtotal.toFixed(2)}</span>
                </div>
                {checkoutState.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success-color)' }}>
                    <span>Discount {checkoutState.promoCode ? `(${checkoutState.promoCode})` : ''}</span>
                    <span>-₹{checkoutState.discount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>GST (8%)</span>
                  <span>₹{checkoutState.gst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Delivery Charges</span>
                  <span>{checkoutState.delivery === 0 ? 'FREE' : `₹${checkoutState.delivery.toFixed(2)}`}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 'bold', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.2rem', marginBottom: '1.5rem' }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary-color)' }}>₹{checkoutState.total.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary-color)', fontSize: '0.85rem', background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
                <Clock size={16} />
                <span>Estimated Serving/Delivery: <b>15 mins</b></span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

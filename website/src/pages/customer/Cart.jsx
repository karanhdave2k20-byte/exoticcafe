import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Tag, Info } from 'lucide-react';
import { useStore } from '../../StoreContext';
import Navbar from '../../components/Navbar';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, cartTotal, loyaltyPoints } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [tip, setTip] = useState(0);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const cleanPromo = promoInput.trim().toUpperCase();
    if (cleanPromo === 'EXOTIC20') {
      setDiscountPercent(20);
      setAppliedPromo('EXOTIC20');
      setPromoInput('');
    } else {
      setDiscountPercent(0);
      setAppliedPromo('');
    }
  };

  const gst = cartTotal * 0.08;
  const discount = (cartTotal * discountPercent) / 100;
  
  // Free delivery for orders > ₹500 or for table ordering (if tableNo exists)
  const deliveryCharge = (cartTotal > 500 || cartTotal === 0) ? 0 : 40;
  
  const grandTotal = cartTotal + gst + deliveryCharge - discount + tip;

  const handleProceedCheckout = () => {
    // Navigate to Checkout (/pay) carrying pricing states
    navigate('/pay', { 
      state: { 
        subtotal: cartTotal, 
        gst, 
        delivery: deliveryCharge, 
        discount, 
        tip,
        total: grandTotal,
        promoCode: appliedPromo
      } 
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingBottom: '4rem' }}>
      <Navbar />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', marginBottom: '2rem', textAlign: 'center', color: 'var(--primary-color)' }}>
          Your Cart
        </h2>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            {/* 6. Empty Cart Illustration */}
            <div style={{ background: 'var(--bg-card-hover)', padding: '2rem', borderRadius: '50%', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={64} color="var(--primary-color)" style={{ opacity: 0.3 }} />
            </div>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>Your Cart is Empty</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '300px' }}>
              Looks like you haven't added anything to your order yet. Let's find something delicious!
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/menu')}>
              Browse Menu
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            
            {/* Cart Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map(item => (
                <div key={item.id} className="glass-panel" style={{ display: 'flex', gap: '1.2rem', padding: '1.2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <img src={item.img} alt={item.name} style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.1rem' }}>{item.name}</h4>
                    <p style={{ color: 'var(--primary-color)', fontWeight: 'bold', margin: 0 }}>₹{item.price.toFixed(2)}</p>
                  </div>

                  {/* Quantity controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-full)', padding: '0.3rem 0.6rem' }}>
                    <button onClick={() => updateQuantity(item.id, -1)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>-</button>
                    <span style={{ width: '20px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-color)', color: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>+</button>
                  </div>

                  {/* Remove Button */}
                  <button onClick={() => removeFromCart(item.id)} style={{ color: 'var(--danger-color)', padding: '0.5rem', background: 'transparent', border: 'none' }}>
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* Promo Code Form */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={18} /> Have a Promo Code?
              </h4>
              <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '1rem' }}>
                <input 
                  type="text" 
                  placeholder="Enter code (e.g. EXOTIC20)" 
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  style={{ flex: 1, padding: '0.6rem 1rem', background: 'var(--bg-card-hover)', border: 'none' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
                  Apply
                </button>
              </form>
              {appliedPromo && (
                <p style={{ color: 'var(--success-color)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 'bold' }}>
                  Code "{appliedPromo}" applied! You saved {discountPercent}% on items.
                </p>
              )}
            </div>

            {/* Order Summary Calculations */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
                Order Summary
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success-color)' }}>
                    <span>Promo Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>GST (8%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Delivery Charges</span>
                  <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}</span>
                </div>
                {tip > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary-color)' }}>
                    <span>Add Tip</span>
                    <span>₹{tip.toFixed(2)}</span>
                  </div>
                )}
                
                {deliveryCharge > 0 && (
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Info size={12} color="var(--primary-color)" /> Add items worth ₹{(500 - cartTotal).toFixed(2)} more for FREE delivery.
                  </p>
                )}
              </div>

              {/* Tip Selector */}
              <div style={{ marginBottom: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.2rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Support our staff (Tip):</span>
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.6rem' }}>
                  {[0, 10, 20, 50].map(val => (
                    <button 
                      key={val} 
                      type="button"
                      onClick={() => setTip(val)}
                      style={{ 
                        flex: 1, 
                        padding: '0.4rem 0.2rem', 
                        borderRadius: 'var(--radius-sm)', 
                        background: tip === val ? 'var(--primary-color)' : 'var(--bg-card-hover)', 
                        color: tip === val ? '#121212' : 'var(--text-main)',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}
                    >
                      {val === 0 ? 'No Tip' : `₹${val}`}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 'bold', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.2rem', marginBottom: '2rem' }}>
                <span>Grand Total</span>
                <span style={{ color: 'var(--primary-color)' }}>₹{grandTotal.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <button className="btn btn-primary btn-block" onClick={handleProceedCheckout} style={{ padding: '1.2rem', fontSize: '1.1rem', gap: '0.8rem' }}>
                  Proceed to Checkout <ArrowRight size={20} />
                </button>
                <button className="btn btn-outline btn-block" onClick={() => navigate('/menu')} style={{ padding: '1rem', fontSize: '1rem', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                  Continue Shopping
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

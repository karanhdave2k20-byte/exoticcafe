'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingBag, Trash2, Plus, Minus, Tag, CheckCircle2, 
  ArrowRight, Sparkles, HeartHandshake, ShieldCheck, User, 
  Coffee, Receipt, Clock, AlertCircle, Users 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import BackButton from '../../components/BackButton';

export default function CartPage() {
  const router = useRouter();
  const { 
    cart, updateQuantity, removeFromCart, clearCart, 
    cartTotal, placeOrder, showToast, tableInfo, 
    currentSession, currentOrderId, orderStatus 
  } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoInput.trim().toUpperCase();
    if (clean === 'HIVE10' || clean === 'EXOTIC20') {
      const discountVal = clean === 'EXOTIC20' ? 20 : 10;
      setDiscountPercent(discountVal);
      setAppliedPromo(clean);
      setPromoInput('');
      showToast(`Promo coupon ${clean} applied: ${discountVal}% OFF! 🎉`, 'success');
    } else {
      setDiscountPercent(0);
      setAppliedPromo('');
      showToast('Invalid coupon. Try "HIVE10" or "EXOTIC20".', 'error');
    }
  };

  const gst = cartTotal * 0.08;
  const discount = (cartTotal * discountPercent) / 100;
  const grandTotal = Math.max(0, cartTotal + gst - discount);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    const orderId = await placeOrder();
    setIsSubmitting(false);

    if (orderId) {
      setPlacedOrderId(orderId);
    }
  };

  // State: Order Confirmed Screen
  if (placedOrderId) {
    return (
      <div className="max-w-lg mx-auto py-6 flex flex-col gap-6 animate-fade-in text-center">
        <div className="flex items-center justify-start">
          <BackButton href="/menu" label="Back to Menu" />
        </div>
        <div className="glass-card p-8 rounded-3xl border border-warm-border bg-white shadow-glass flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-700">
              Kitchen Dispatch Active
            </span>
            <h2 className="text-3xl font-serif font-black text-roast-900 mt-1">
              Order Confirmed!
            </h2>
            <p className="text-xs text-muted mt-1 max-w-sm">
              Your table order has been transmitted directly to our café kitchen display system.
            </p>
          </div>

          {/* Order Details Ticket */}
          <div className="w-full p-4 rounded-2xl bg-warm-subtle border border-warm-border flex flex-col gap-3 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-warm-border">
              <div>
                <span className="text-[11px] text-muted uppercase font-bold block">Order Number</span>
                <span className="font-mono text-base font-black text-roast-900">#{placedOrderId}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-muted uppercase font-bold block">Table</span>
                <span className="font-serif text-base font-black text-caramel-700">Table #{tableInfo?.tableNo || '05'}</span>
              </div>
            </div>

            {/* Status Timeline */}
            <div>
              <span className="text-[11px] text-muted uppercase font-bold block mb-2">Live Preparation Status</span>
              <div className="flex items-center justify-between gap-1 text-[11px] font-bold">
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-caramel-900 border border-amber-300">
                  🟡 Received
                </span>
                <span className="text-muted">→</span>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  🔵 Preparing
                </span>
                <span className="text-muted">→</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  🟢 Ready
                </span>
                <span className="text-muted">→</span>
                <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                  ✅ Served
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-3 mt-2">
            <Link
              href="/track"
              className="btn-primary flex-1 py-3.5 text-xs font-bold shadow-gold flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span>Track Live Timeline</span>
            </Link>

            <Link
              href={`/pay?total=${grandTotal.toFixed(2)}&order=${placedOrderId}`}
              className="btn-secondary flex-1 py-3.5 text-xs font-bold text-roast-900 flex items-center justify-center gap-2 border-warm-border"
            >
              <Receipt className="w-4 h-4 text-caramel-600" />
              <span>Paytm / Split Bill</span>
            </Link>
          </div>

          <Link
            href="/fun"
            className="text-xs text-muted hover:text-caramel-700 font-bold underline"
          >
            Play 2048 or explore entertainment while waiting 🎮
          </Link>
        </div>
      </div>
    );
  }

  // State: Empty Cart
  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-10 flex flex-col gap-4 animate-fade-in">
        <div className="flex items-center justify-start">
          <BackButton href="/menu" label="Back to Menu" />
        </div>
        <div className="text-center flex flex-col items-center gap-4 glass-card rounded-3xl p-8 bg-white border border-warm-border shadow-glass">
        <div className="w-20 h-20 rounded-full bg-warm-subtle text-caramel-600 border border-warm-border flex items-center justify-center mb-2 shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <span className="text-xs uppercase tracking-widest font-extrabold text-caramel-700">
          Table #{tableInfo?.tableNo || '05'}
        </span>
        <h2 className="text-2xl font-serif font-black text-roast-900">
          Your Shared Table Cart is Empty
        </h2>
        <p className="text-xs text-muted max-w-xs leading-relaxed">
          No items have been selected for Table #{tableInfo?.tableNo || '05'} yet. Browse our handcrafted beverages, pizzas, and burger platters!
        </p>
          <Link
            href="/menu"
            className="btn-primary px-8 py-3.5 text-xs font-bold shadow-gold mt-2"
          >
            Explore Café Menu 🍽️
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full py-6 flex flex-col gap-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <BackButton href="/menu" label="Back to Menu" />
      </div>
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-warm-border pb-4 gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-caramel-50 border border-caramel-200 text-caramel-800 text-xs font-bold tracking-widest uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-caramel-600" />
            <span>Table #{tableInfo?.tableNo || '05'} • Shared Table Cart</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-roast-900">
            Review Your Table Order
          </h1>
          <p className="text-xs text-muted mt-0.5">
            One Table = One Shared Cart. Dishes are tagged with the companion who added them.
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1 w-fit"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Table Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items List (Table Shared Concept) */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {cart.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="glass-card p-4 rounded-2xl flex items-start gap-4 border border-warm-border bg-white shadow-sm"
            >
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-warm-subtle flex-shrink-0 border border-warm-border">
                <Image
                  src={item.img}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-roast-900 leading-snug">
                      {item.name}
                    </h3>
                    
                    {/* Attribution Tag (Section 7) */}
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-warm-subtle border border-warm-border text-[10px] font-bold text-caramel-800 mt-1">
                      <User className="w-3 h-3 text-caramel-600" />
                      <span>Added by: {item.forGuest || 'Guest'}</span>
                    </div>

                    {item.customization && (
                      <p className="text-[11px] text-muted mt-1">
                        {[
                          item.customization.milk,
                          item.customization.temperature,
                          item.customization.extraShot ? '+Extra Shot' : null,
                          item.customization.note ? `Note: "${item.customization.note}"` : null
                        ].filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </div>

                  <span className="text-sm font-black text-roast-900 font-mono">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-warm-border/60">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(idx, -1)}
                      className="w-7 h-7 rounded-lg bg-warm-subtle border border-warm-border text-roast-900 flex items-center justify-center hover:bg-caramel-50 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black font-mono w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(idx, 1)}
                      className="w-7 h-7 rounded-lg bg-warm-subtle border border-warm-border text-roast-900 flex items-center justify-center hover:bg-caramel-50 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(idx)}
                    className="text-xs text-rose-500 hover:text-rose-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Confirmation Box */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-5 rounded-3xl border border-warm-border bg-white shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-serif font-black text-roast-900 uppercase tracking-wider">
              Order Breakdown
            </h3>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-caramel-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Coupon code (HIVE10)"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="w-full glass-input pl-9 pr-3 py-2 rounded-xl text-xs uppercase font-bold"
                />
              </div>
              <button
                type="submit"
                className="btn-secondary px-4 py-2 text-xs font-bold"
              >
                Apply
              </button>
            </form>

            {appliedPromo && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between font-bold">
                <span>Coupon Applied: {appliedPromo}</span>
                <span>-{discountPercent}%</span>
              </div>
            )}

            {/* Price Calculations */}
            <div className="flex flex-col gap-2 pt-2 border-t border-warm-border text-xs">
              <div className="flex items-center justify-between text-muted">
                <span>Items Subtotal</span>
                <span className="font-mono font-bold text-roast-900">₹{cartTotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-bold">
                  <span>Special Discount</span>
                  <span className="font-mono">-₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-muted">
                <span>GST (8%)</span>
                <span className="font-mono font-bold text-roast-900">₹{gst.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-warm-border text-sm font-black text-roast-900">
                <span>Final Table Total</span>
                <span className="font-mono text-lg text-caramel-700">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order CTA (Section 8) */}
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="btn-primary w-full py-4 text-sm font-bold shadow-gold flex items-center justify-center gap-2 group mt-2"
            >
              {isSubmitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <span>Place Order for Table #{tableInfo?.tableNo || '05'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-warm-subtle border border-warm-border text-xs text-muted flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-caramel-600 flex-shrink-0" />
            <span>Dishes are prepared fresh to order. Split bill & online payment available immediately after placing.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

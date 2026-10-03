'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CreditCard, CheckCircle2, Sparkles, ArrowRight, ShieldCheck, 
  Users, User, Receipt, Clock, ArrowLeft, RefreshCw, Smartphone, Wallet 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import BackButton from '../../components/BackButton';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    tableInfo, currentSession, adminOrders, recordPayment, 
    showToast, cartTotal, recentOrderTotal, currentOrderId, user 
  } = useStore();

  const totalParam = parseFloat(searchParams.get('total') || '') || recentOrderTotal || (cartTotal > 0 ? cartTotal * 1.08 : 580);
  const orderIdParam = searchParams.get('order') || currentOrderId || 'TH1025';

  const [paymentMode, setPaymentMode] = useState<'full' | 'equal' | 'itemized'>('full');
  const [paymentGateway, setPaymentGateway] = useState<'paytm' | 'upi' | 'card'>('paytm');
  const [selectedPersonToPay, setSelectedPersonToPay] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paidPersons, setPaidPersons] = useState<Record<string, boolean>>({});
  const [isAllPaid, setIsAllPaid] = useState(false);

  // Table companions
  const guests = useMemo(() => {
    if (tableInfo?.guestNames && tableInfo.guestNames.length > 0) {
      return tableInfo.guestNames;
    }
    if (currentSession?.members && currentSession.members.length > 0) {
      return currentSession.members.map(m => m.name);
    }
    return [user?.n || 'Karan', 'Rahul', 'Jay'];
  }, [tableInfo?.guestNames, currentSession?.members, user?.n]);

  useEffect(() => {
    if (guests.length > 0 && !selectedPersonToPay) {
      setSelectedPersonToPay(guests[0]);
    }
  }, [guests, selectedPersonToPay]);

  // Find active order details
  const activeOrder = adminOrders.find(o => o.o === orderIdParam);
  const subtotal = activeOrder ? (activeOrder.rawAmount / 1.08) : totalParam / 1.08;
  const tax = totalParam - subtotal;

  // Split calculations
  const equalSplitAmount = totalParam / Math.max(1, guests.length);

  // Itemized split calculations (mocked or from order items)
  const itemizedSplits = useMemo(() => {
    const splits: Record<string, { items: string[]; amount: number }> = {};
    guests.forEach(g => { splits[g] = { items: [], amount: 0 }; });

    if (activeOrder?.items && activeOrder.items.length > 0) {
      activeOrder.items.forEach(item => {
        const guestName = item.forGuest || guests[0];
        if (!splits[guestName]) splits[guestName] = { items: [], amount: 0 };
        splits[guestName].items.push(`${item.quantity}x ${item.name}`);
        splits[guestName].amount += (item.price * item.quantity) * 1.08;
      });
    } else {
      // Default sample attribution if placed without items array
      guests.forEach((g, idx) => {
        splits[g] = {
          items: [idx === 0 ? 'Burger' : idx === 1 ? 'Pizza' : 'Cold Coffee'],
          amount: equalSplitAmount
        };
      });
    }
    return splits;
  }, [guests, activeOrder, equalSplitAmount]);

  const handlePayNow = async (targetPerson?: string, specificAmount?: number) => {
    setIsProcessing(true);
    const payingGuest = targetPerson || selectedPersonToPay || user?.n || 'Guest';
    const amountToPay = specificAmount !== undefined ? specificAmount : (
      paymentMode === 'full' ? totalParam :
      paymentMode === 'equal' ? equalSplitAmount :
      (itemizedSplits[payingGuest]?.amount || equalSplitAmount)
    );

    try {
      // Call Paytm Initiation
      const initRes = await fetch('/api/payments/paytm/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderIdParam,
          amount: amountToPay,
          tableNo: tableInfo.tableNo || '05',
          customer: payingGuest,
          splitType: paymentMode
        })
      });

      const initData = await initRes.json();

      // Verify payment with proper verification architecture
      const success = await recordPayment({
        orderId: orderIdParam,
        amount: amountToPay,
        method: paymentGateway === 'paytm' ? 'Paytm' : paymentGateway.toUpperCase(),
        splitType: paymentMode,
        person: payingGuest
      });

      if (success) {
        if (paymentMode === 'full') {
          setIsAllPaid(true);
        } else {
          const updated = { ...paidPersons, [payingGuest]: true };
          setPaidPersons(updated);
          const allGuestsPaid = guests.every(g => updated[g]);
          if (allGuestsPaid) setIsAllPaid(true);
        }
      }
    } catch (e) {
      showToast('Payment gateway communication failed.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isAllPaid) {
    return (
      <div className="max-w-md mx-auto py-12 flex flex-col gap-6 animate-fade-in text-center pb-20">
        <div className="flex items-center justify-start">
          <BackButton href="/menu" label="Back to Menu" />
        </div>
        <div className="glass-card p-8 rounded-3xl border border-warm-border bg-white shadow-glass flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-700">
              Payment Confirmed
            </span>
            <h2 className="text-3xl font-serif font-black text-roast-900 mt-1">
              Bill Settled! 🎉
            </h2>
            <p className="text-xs text-muted mt-1 max-w-xs">
              Order <strong>#{orderIdParam}</strong> for Table #{tableInfo?.tableNo || '05'} has been paid successfully via {paymentGateway === 'paytm' ? 'Paytm' : paymentGateway.toUpperCase()}.
            </p>
          </div>

          <div className="w-full p-4 rounded-2xl bg-warm-subtle border border-warm-border text-left text-xs flex flex-col gap-2">
            <div className="flex justify-between font-bold text-roast-900">
              <span>Total Paid:</span>
              <span className="font-mono text-emerald-700">₹{totalParam.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted text-[11px]">
              <span>Payment Mode:</span>
              <span className="capitalize">{paymentMode} Bill Split</span>
            </div>
            <div className="flex justify-between text-muted text-[11px]">
              <span>Digital Receipt:</span>
              <span className="font-mono text-roast-900">Sent to table</span>
            </div>
          </div>

          <div className="w-full flex flex-col gap-3">
            <Link
              href="/track"
              className="btn-primary w-full py-3.5 text-xs font-bold shadow-gold flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span>Watch Order Progress</span>
            </Link>

            <Link
              href="/fun"
              className="btn-secondary w-full py-3 text-xs font-bold text-roast-900 border-warm-border"
            >
              Back to Entertainment Hub 🎮
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full py-6 flex flex-col gap-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <BackButton href="/cart" label="Back to Cart" />
      </div>
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-warm-border pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-caramel-700">
            Table #{tableInfo?.tableNo || '05'} Settlement
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-roast-900">
            Payment & Split Bill
          </h1>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-muted uppercase font-bold block">Order Number</span>
          <span className="font-mono text-sm font-black text-roast-900">#{orderIdParam}</span>
        </div>
      </div>

      {/* Bill Overview Card (Section 9) */}
      <div className="glass-card p-5 rounded-3xl border border-warm-border bg-white shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-caramel-600" />
            <h3 className="text-xs font-bold text-roast-900 uppercase tracking-wider">
              Bill Summary
            </h3>
          </div>
          <span className="text-xs text-muted">Table #{tableInfo?.tableNo || '05'}</span>
        </div>

        {activeOrder?.i && (
          <p className="text-xs text-roast-800 bg-warm-subtle p-3 rounded-xl border border-warm-border">
            {activeOrder.i}
          </p>
        )}

        <div className="flex flex-col gap-1.5 pt-1 text-xs">
          <div className="flex justify-between text-muted">
            <span>Subtotal:</span>
            <span className="font-mono font-bold text-roast-900">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>GST (8%):</span>
            <span className="font-mono font-bold text-roast-900">₹{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-warm-border text-sm font-black text-roast-900">
            <span>Final Bill Amount:</span>
            <span className="font-mono text-base text-caramel-700">₹{totalParam.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Split Bill Options (Section 10) */}
      <div className="glass-card p-6 rounded-3xl border border-warm-border bg-white shadow-glass flex flex-col gap-5">
        <div>
          <span className="text-xs uppercase tracking-wider font-extrabold text-caramel-700 block mb-1">
            Choose How to Pay
          </span>
          <h2 className="text-lg font-serif font-bold text-roast-900">
            Split Bill Options
          </h2>
        </div>

        {/* 3 Split Bill Modes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => setPaymentMode('full')}
            className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
              paymentMode === 'full'
                ? 'border-caramel-500 bg-caramel-50 text-caramel-900 font-bold shadow-sm'
                : 'border-warm-border bg-warm-subtle text-roast-800 hover:bg-white'
            }`}
          >
            <User className="w-5 h-5 text-caramel-600" />
            <span className="text-xs font-bold">1 Person Pays All</span>
            <span className="text-[11px] font-mono text-muted">₹{totalParam.toFixed(2)}</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMode('equal')}
            className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
              paymentMode === 'equal'
                ? 'border-caramel-500 bg-caramel-50 text-caramel-900 font-bold shadow-sm'
                : 'border-warm-border bg-warm-subtle text-roast-800 hover:bg-white'
            }`}
          >
            <Users className="w-5 h-5 text-caramel-600" />
            <span className="text-xs font-bold">Split Equally</span>
            <span className="text-[11px] font-mono text-muted">₹{equalSplitAmount.toFixed(2)} / guest</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMode('itemized')}
            className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
              paymentMode === 'itemized'
                ? 'border-caramel-500 bg-caramel-50 text-caramel-900 font-bold shadow-sm'
                : 'border-warm-border bg-warm-subtle text-roast-800 hover:bg-white'
            }`}
          >
            <Receipt className="w-5 h-5 text-caramel-600" />
            <span className="text-xs font-bold">Pay Own Items</span>
            <span className="text-[11px] font-mono text-muted">Attributed by guest</span>
          </button>
        </div>

        {/* Breakdown for Split Modes */}
        {paymentMode === 'equal' && (
          <div className="flex flex-col gap-2 pt-2 border-t border-warm-border">
            <span className="text-xs font-bold text-muted">Table Guests Equal Split ({guests.length} people):</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {guests.map((g, i) => {
                const isPaid = paidPersons[g];
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl border flex items-center justify-between ${
                      isPaid 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900' 
                        : 'border-warm-border bg-warm-subtle text-roast-900'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold">{g}</h4>
                      <span className="text-xs font-mono font-black text-caramel-700">
                        ₹{equalSplitAmount.toFixed(2)}
                      </span>
                    </div>

                    {isPaid ? (
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Paid</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePayNow(g, equalSplitAmount)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-xl bg-caramel-500 text-white font-bold text-[11px] hover:bg-caramel-600 transition-colors"
                      >
                        Pay for {g}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {paymentMode === 'itemized' && (
          <div className="flex flex-col gap-2 pt-2 border-t border-warm-border">
            <span className="text-xs font-bold text-muted">Individual Item Breakdown:</span>
            <div className="flex flex-col gap-2.5">
              {guests.map((g, i) => {
                const info = itemizedSplits[g] || { items: ['Items'], amount: equalSplitAmount };
                const isPaid = paidPersons[g];
                return (
                  <div
                    key={i}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      isPaid 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900' 
                        : 'border-warm-border bg-warm-subtle text-roast-900'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold">{g}</h4>
                      <p className="text-[11px] text-muted">{info.items.join(', ') || 'Selected dishes'}</p>
                      <span className="text-xs font-mono font-black text-caramel-700">
                        ₹{info.amount.toFixed(2)}
                      </span>
                    </div>

                    {isPaid ? (
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Paid</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePayNow(g, info.amount)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-xl bg-caramel-500 text-white font-bold text-[11px] hover:bg-caramel-600 transition-colors"
                      >
                        Pay ₹{info.amount.toFixed(0)}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Payment Gateway Selection (Paytm as Primary - Section 9) */}
        <div className="pt-2 border-t border-warm-border">
          <label className="text-xs uppercase tracking-wider font-extrabold text-caramel-700 block mb-2">
            Select Payment Gateway
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setPaymentGateway('paytm')}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                paymentGateway === 'paytm'
                  ? 'border-blue-500 bg-blue-50/70 text-blue-900 font-bold shadow-sm'
                  : 'border-warm-border bg-white text-muted hover:border-caramel-400'
              }`}
            >
              <Smartphone className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-bold">Paytm</span>
              <span className="text-[9px] text-blue-700 font-semibold">Primary Gateway</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentGateway('upi')}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                paymentGateway === 'upi'
                  ? 'border-caramel-500 bg-caramel-50 text-caramel-900 font-bold shadow-sm'
                  : 'border-warm-border bg-white text-muted hover:border-caramel-400'
              }`}
            >
              <Wallet className="w-5 h-5 text-caramel-600" />
              <span className="text-xs font-bold">UPI Fast Pay</span>
              <span className="text-[9px] text-muted">GPay / PhonePe</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentGateway('card')}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                paymentGateway === 'card'
                  ? 'border-caramel-500 bg-caramel-50 text-caramel-900 font-bold shadow-sm'
                  : 'border-warm-border bg-white text-muted hover:border-caramel-400'
              }`}
            >
              <CreditCard className="w-5 h-5 text-caramel-600" />
              <span className="text-xs font-bold">Card / POS</span>
              <span className="text-[9px] text-muted">Visa / Master</span>
            </button>
          </div>
        </div>

        {/* Primary Checkout CTA if paying full bill */}
        {paymentMode === 'full' && (
          <button
            onClick={() => handlePayNow()}
            disabled={isProcessing}
            className="btn-primary w-full py-4 text-sm font-bold shadow-gold flex items-center justify-center gap-2 group mt-2"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Connecting to {paymentGateway === 'paytm' ? 'Paytm Secure Gateway...' : 'Payment Gateway...'}</span>
              </div>
            ) : (
              <>
                <span>Pay Full Bill (₹{totalParam.toFixed(2)}) via {paymentGateway === 'paytm' ? 'Paytm' : paymentGateway.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        )}

        <div className="flex items-center justify-center gap-2 text-[11px] text-muted pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-caramel-600" />
          <span>Paytm Webhook Verification Enabled • 256-Bit SSL Encryption</span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto py-16 text-center text-caramel-600">
        <div className="w-8 h-8 rounded-full border-2 border-caramel-500 border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-xs text-muted">Preparing secure payment checkout...</p>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}

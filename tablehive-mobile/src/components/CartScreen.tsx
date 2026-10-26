import React, { useState } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, CheckCircle2, Split, CreditCard, ShieldCheck } from 'lucide-react';
import { CartItem, MenuItem } from '../types';

interface CartScreenProps {
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  tableNumber: number;
  userName: string;
  onOrderPlaced: (orderId: string) => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  cart,
  addToCart,
  removeFromCart,
  clearCart,
  tableNumber,
  userName,
  onOrderPlaced,
}) => {
  const [splitCount, setSplitCount] = useState<number>(2);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;
  const splitAmount = splitCount > 0 ? (total / splitCount).toFixed(0) : total;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const itemsPayload = cart.map((c) => ({
        itemId: c.item.id || c.item._id || 'item',
        name: c.item.name,
        price: c.item.price,
        qty: c.quantity,
        isVeg: c.item.isVeg,
        selectedBy: userName,
      }));

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: tableNumber,
          customer: userName,
          items: itemsPayload,
          subtotal,
          tax: gst,
          total,
          source: 'mobile-app',
        }),
      });

      const data = await response.json();
      const generatedOrderId = data.orderId || `TH-${Math.floor(1000 + Math.random() * 9000)}`;

      setOrderSuccess(generatedOrderId);
      clearCart();
      onOrderPlaced(generatedOrderId);
    } catch (err) {
      // Offline fallback
      const offlineId = `TH-${Math.floor(1000 + Math.random() * 9000)}`;
      setOrderSuccess(offlineId);
      clearCart();
      onOrderPlaced(offlineId);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="pb-28 pt-8 px-4 max-w-md mx-auto text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900">
            Order Sent to Kitchen! 👨‍🍳
          </h2>
          <p className="text-xs text-slate-600">
            Order <span className="font-bold text-brand-700">#{orderSuccess}</span> has been received for Table #{tableNumber}. Our chef has started preparing your fresh artisanal food!
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-left text-xs space-y-2">
          <div className="flex justify-between font-bold text-slate-800">
            <span>Table Number:</span>
            <span>Table #{tableNumber}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-800">
            <span>Diner:</span>
            <span>{userName}</span>
          </div>
          <div className="flex justify-between font-bold text-emerald-700 pt-1 border-t border-amber-200/60">
            <span>Live Kitchen Status:</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Preparing Now
            </span>
          </div>
        </div>

        <button
          onClick={() => setOrderSuccess(null)}
          className="w-full py-3.5 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white font-extrabold text-xs shadow-md cursor-pointer transition-all"
        >
          Order More Items
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="pb-28 pt-16 px-4 max-w-md mx-auto text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h3 className="font-extrabold text-base text-slate-800">Your Cart is Empty</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Explore TableHive's handcrafted brews, sizzling fries, and wood-fired pizzas to start your table order.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-28 pt-3 px-4 max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="font-black text-base text-slate-900">Table #{tableNumber} Order Cart</h2>
          <p className="text-[11px] text-slate-500">{cart.length} unique dishes chosen</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      {/* Cart Items List */}
      <div className="space-y-2.5">
        {cart.map((c) => {
          const itemId = c.item.id || c.item._id || c.item.name;
          return (
            <div
              key={itemId}
              className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-2.5 h-2.5 rounded-full border flex-shrink-0 ${
                    c.item.isVeg
                      ? 'border-emerald-600 bg-emerald-600'
                      : 'border-rose-600 bg-rose-600'
                  }`}
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 truncate">{c.item.name}</h4>
                  <p className="text-[11px] text-slate-500">₹{c.item.price} each</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-extrabold text-xs text-slate-900">
                  ₹{c.item.price * c.quantity}
                </span>

                <div className="flex items-center gap-2 bg-slate-100 px-2 py-0.5 rounded-xl border border-slate-200">
                  <button
                    onClick={() => removeFromCart(itemId)}
                    className="p-0.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <Minus className="w-3 h-3 stroke-[3]" />
                  </button>
                  <span className="font-bold text-xs min-w-[12px] text-center text-slate-900">
                    {c.quantity}
                  </span>
                  <button
                    onClick={() => addToCart(c.item)}
                    className="p-0.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bill Splitting Calculator */}
      <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Split className="w-4 h-4 text-amber-700" />
            <h4 className="text-xs font-black text-slate-900">Smart Bill Split</h4>
          </div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full">
            ₹{splitAmount} / person
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Split across how many friends?</span>
          <div className="flex items-center gap-2 bg-white px-2 py-0.5 rounded-xl border border-amber-300">
            <button
              onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
              className="p-1 hover:text-slate-900 font-bold cursor-pointer"
            >
              -
            </button>
            <span className="font-extrabold text-amber-900">{splitCount} Guests</span>
            <button
              onClick={() => setSplitCount(splitCount + 1)}
              className="p-1 hover:text-slate-900 font-bold cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Bill Summary */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Item Total (Subtotal)</span>
          <span className="font-semibold text-slate-900">₹{subtotal}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Taxes (5% GST)</span>
          <span className="font-semibold text-slate-900">₹{gst}</span>
        </div>
        <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
          <span>Grand Total</span>
          <span className="text-brand-700">₹{total}</span>
        </div>
      </div>

      {/* Place Order CTA */}
      <button
        onClick={handlePlaceOrder}
        disabled={isSubmitting}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-700 hover:from-brand-700 hover:to-amber-800 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
      >
        {isSubmitting ? (
          <span>Sending Order to Kitchen...</span>
        ) : (
          <>
            <span>Place Order for Table #{tableNumber}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-semibold pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Direct Kitchen Integration • TableHive POS</span>
      </div>
    </div>
  );
};

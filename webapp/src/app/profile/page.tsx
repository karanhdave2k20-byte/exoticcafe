'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  User, Mail, Phone, Coffee, Clock, Heart, CreditCard, 
  Settings, LogOut, CheckCircle2, ChevronRight, Sparkles, 
  Receipt, ArrowRight, ShieldCheck, Tag, Utensils, AlertCircle 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import BackButton from '../../components/BackButton';

export default function ProfilePage() {
  const { 
    user, setUser, tableInfo, currentSession, endTableSession, 
    logoutCustomer, adminOrders, adminPayments, favorites, 
    mockMenu, isPureVeg, togglePureVeg, loyaltyPoints, showToast 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'favorites' | 'payments' | 'preferences'>('orders');

  // Filter user's previous orders
  const userContact = user?.c || user?.contact || '';
  const userName = user?.n || user?.name || '';
  
  const myOrders = adminOrders.filter(o => 
    (userContact && o.contact === userContact) || 
    (userName && o.customerName === userName) ||
    (tableInfo?.tableNo && o.t === String(tableInfo.tableNo))
  );

  const myPayments = adminPayments.filter(p =>
    (userName && p.customer?.toLowerCase().includes(userName.toLowerCase())) ||
    (tableInfo?.tableNo && p.rel?.includes(String(tableInfo.tableNo)))
  );

  const myFavorites = mockMenu.filter(m => favorites.includes(m.id));

  return (
    <div className="max-w-5xl mx-auto w-full py-6 flex flex-col gap-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <BackButton href="/menu" label="Back to Menu" />
      </div>
      {/* Profile Header Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-warm-border bg-gradient-to-b from-white via-warm-subtle to-white shadow-glass flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-caramel-500 to-caramel-600 p-1 shadow-gold flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center overflow-hidden">
              <span className="text-3xl font-serif font-black text-caramel-700">
                {userName ? userName.charAt(0).toUpperCase() : 'G'}
              </span>
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-white text-white">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-serif font-bold text-roast-900">
                {userName || 'Guest Diner'}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-xs text-muted">
                <Mail className="w-3.5 h-3.5 text-caramel-600" />
                <span>{userContact || 'No contact registered'}</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-caramel-50 border border-caramel-200 text-caramel-800 text-xs font-bold shadow-sm mx-auto sm:mx-0">
              <Sparkles className="w-3.5 h-3.5 text-caramel-600" />
              <span>{loyaltyPoints} Hive Points</span>
            </div>
          </div>

          {/* Table Session Ribbon */}
          {tableInfo?.tableNo ? (
            <div className="mt-4 p-3 rounded-2xl bg-caramel-50/80 border border-caramel-200/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-caramel-700 flex-shrink-0" />
                <span className="text-caramel-900">
                  Active at <strong>Table #{tableInfo.tableNo}</strong>
                  {currentSession?.members && currentSession.members.length > 1 && (
                    <span className="text-caramel-700 ml-1">({currentSession.members.length} friends seated)</span>
                  )}
                </span>
              </div>
              <button
                onClick={endTableSession}
                className="px-3 py-1 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors text-[11px]"
              >
                Leave Table
              </button>
            </div>
          ) : (
            <div className="mt-4 p-3 rounded-2xl bg-warm-subtle border border-warm-border flex items-center justify-between text-xs text-muted">
              <span>No active table session</span>
              <Link href="/" className="text-caramel-700 font-bold hover:underline">
                Join a Table →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-warm-border pb-1 overflow-x-auto">
        {[
          { id: 'orders', label: 'Previous Orders', count: myOrders.length },
          { id: 'favorites', label: 'Saved Favorites', count: myFavorites.length },
          { id: 'payments', label: 'Payment History', count: myPayments.length },
          { id: 'preferences', label: 'Preferences' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-caramel-500 text-white shadow-sm'
                : 'text-muted hover:text-roast-900 hover:bg-warm-subtle'
            }`}
          >
            {t.label} {t.count !== undefined && `(${t.count})`}
          </button>
        ))}
      </div>

      {/* Tab: Orders */}
      {activeTab === 'orders' && (
        <div className="flex flex-col gap-3">
          {myOrders.length === 0 ? (
            <div className="glass-card p-8 rounded-3xl border border-warm-border text-center text-muted flex flex-col items-center gap-3">
              <Utensils className="w-10 h-10 text-caramel-500/50" />
              <p className="text-xs">No orders recorded yet. Order delicious bites from the menu!</p>
              <Link href="/menu" className="btn-primary px-6 py-2.5 text-xs font-bold shadow-gold">
                Browse Café Menu
              </Link>
            </div>
          ) : (
            myOrders.map(order => (
              <div 
                key={order.o}
                className="glass-card p-4 rounded-2xl border border-warm-border bg-white flex flex-col gap-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-caramel-700">#{order.o}</span>
                    <span className="text-[11px] text-muted">• Table {order.t}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    order.s === 'Completed' || order.s === 'Served'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-caramel-50 text-caramel-700 border border-caramel-200 animate-pulse-subtle'
                  }`}>
                    {order.s}
                  </span>
                </div>
                <p className="text-xs text-roast-800 line-clamp-2">{order.i}</p>
                <div className="flex items-center justify-between pt-2 border-t border-warm-border/60 text-xs">
                  <span className="font-bold text-roast-900">{order.price}</span>
                  <Link 
                    href={`/track?order=${order.o}`}
                    className="text-caramel-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>View Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Favorites */}
      {activeTab === 'favorites' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {myFavorites.length === 0 ? (
            <div className="sm:col-span-2 glass-card p-8 rounded-3xl border border-warm-border text-center text-muted flex flex-col items-center gap-3">
              <Heart className="w-10 h-10 text-rose-400" />
              <p className="text-xs">You have not marked any favorite dishes yet.</p>
              <Link href="/menu" className="btn-secondary px-6 py-2 text-xs font-bold">
                Find Favorites
              </Link>
            </div>
          ) : (
            myFavorites.map(dish => (
              <div 
                key={dish.id} 
                className="glass-card p-3 rounded-2xl border border-warm-border bg-white flex items-center gap-3 shadow-sm"
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-warm-subtle flex-shrink-0">
                  <Image src={dish.img} alt={dish.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-roast-900 truncate">{dish.name}</h4>
                  <p className="text-[11px] text-muted">₹{dish.price} • {dish.category}</p>
                </div>
                <Link 
                  href="/menu"
                  className="p-2 rounded-xl bg-caramel-50 text-caramel-700 hover:bg-caramel-100 text-xs font-bold"
                >
                  Order
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Payments */}
      {activeTab === 'payments' && (
        <div className="flex flex-col gap-3">
          {myPayments.length === 0 ? (
            <div className="glass-card p-8 rounded-3xl border border-warm-border text-center text-muted flex flex-col items-center gap-3">
              <CreditCard className="w-10 h-10 text-caramel-500/50" />
              <p className="text-xs">No payment history found on this device.</p>
            </div>
          ) : (
            myPayments.map((p, idx) => (
              <div 
                key={p.id || idx}
                className="glass-card p-4 rounded-2xl border border-warm-border bg-white flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-roast-900">
                      Paid via {p.method} {p.person ? `(${p.person})` : ''}
                    </h4>
                    <p className="text-[10px] text-muted">{p.rel} • {p.date ? new Date(p.date).toLocaleDateString() : 'Recent'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-roast-900">{p.amount}</span>
                  <span className="block text-[10px] font-bold text-emerald-600">{p.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Preferences */}
      {activeTab === 'preferences' && (
        <div className="glass-card p-6 rounded-3xl border border-warm-border bg-white flex flex-col gap-4 shadow-sm">
          <h3 className="text-sm font-bold text-roast-900">Dietary & Dining Preferences</h3>
          
          <div className="flex items-center justify-between p-3 rounded-2xl bg-warm-subtle border border-warm-border">
            <div>
              <p className="text-xs font-bold text-roast-900">Pure Vegetarian Mode</p>
              <p className="text-[11px] text-muted">Filter menu dishes strictly to vegetarian items</p>
            </div>
            <button
              onClick={togglePureVeg}
              className={`w-12 h-6 rounded-full transition-colors relative ${isPureVeg ? 'bg-emerald-600' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${isPureVeg ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="pt-2">
            <p className="text-xs font-bold text-roast-900 mb-2">Favorite Interests</p>
            <div className="flex flex-wrap gap-2">
              {['Cricket', 'Music', 'Short Videos', 'News', 'Games', 'Movies'].map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold bg-warm-subtle border border-warm-border text-roast-800">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-warm-border flex justify-between items-center">
            <button
              onClick={logoutCustomer}
              className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <Link
              href="/admin/login"
              className="text-xs text-muted hover:text-caramel-700 font-semibold"
            >
              Switch to Admin Portal →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

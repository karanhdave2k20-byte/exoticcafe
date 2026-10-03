'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  MenuItem, CartItem, TableInfo, UserProfile, AdminUser, 
  OrderRecord, TableRecord, BookingRecord, WaiterCall, PaymentRecord, FeedbackRecord, 
  ThemeMode, ItemCustomization, TableSession, AppNotification, SplitPaymentRecord 
} from '../types';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface StoreContextType {
  // Table & Session
  tableInfo: TableInfo;
  setTableInfo: React.Dispatch<React.SetStateAction<TableInfo>>;
  currentSession: TableSession | null;
  startTableSession: (tableNo: string | number, guestNames?: string[], count?: number) => Promise<TableSession | null>;
  endTableSession: () => Promise<void>;
  setSessionInterests: (interests: string[]) => Promise<void>;
  sendEmailInvite: (email: string) => Promise<boolean>;

  // Authentication
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  adminUser: AdminUser | null;
  setAdminUser: React.Dispatch<React.SetStateAction<AdminUser | null>>;
  logoutCustomer: () => void;
  logoutAdmin: () => void;

  // Shared Table Cart
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (product: MenuItem, customization?: ItemCustomization, forGuest?: string) => void;
  updateQuantity: (index: number, delta: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  cartTotal: number;

  // Order Lifecycle
  placeOrder: () => Promise<string | null>;
  orderStatus: string | null;
  setOrderStatus: React.Dispatch<React.SetStateAction<string | null>>;
  currentOrderId: string | null;
  setCurrentOrderId: React.Dispatch<React.SetStateAction<string | null>>;
  recentOrderTotal: number;

  // Payments
  recordPayment: (paymentData: {
    orderId?: string;
    amount: number;
    method?: string;
    splitType?: 'full' | 'equal' | 'itemized';
    person?: string;
  }) => Promise<boolean>;

  // Preferences & Menu
  theme: ThemeMode;
  isPureVeg: boolean;
  togglePureVeg: () => void;
  favorites: number[];
  toggleFavorite: (productId: number) => void;
  loyaltyPoints: number;
  coffeeStamps: number;
  mockMenu: MenuItem[];
  setMockMenu: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  updateMenuDish: (dish: Partial<MenuItem>) => Promise<boolean>;
  deleteMenuDish: (id: number) => Promise<boolean>;

  // Admin Data & Management
  adminTables: TableRecord[];
  adminOrders: OrderRecord[];
  adminFeedback: FeedbackRecord[];
  adminCustomers: Array<any>;
  adminPayments: PaymentRecord[];
  adminBookings: BookingRecord[];
  waiterCalls: WaiterCall[];
  notifications: AppNotification[];
  callWaiter: (requestType?: string) => Promise<boolean>;
  resolveWaiterCall: (callId: string) => Promise<void>;
  addReservation: (details: any) => Promise<boolean>;
  updateTableStatus: (id: number, status: 'Free' | 'Occupied' | 'Reserved' | 'Ordering') => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  createTable: (seats: number) => Promise<void>;
  deleteTable: (id: number) => Promise<void>;
  handleWipeDatabase: () => Promise<void>;

  // System
  serverIp: string;
  tunnelUrl: string;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
  removeToast: (id: number) => void;
}

const defaultMenu: MenuItem[] = [
  { id: 1, name: 'Crispy Peri-Peri Fries', category: 'Starters', price: 160, img: '/croissant.png', isVeg: true, rating: 4.8, prepTime: 8, desc: 'Golden potato fries tossed in zesty African peri-peri spice dust with garlic dip.', isAvailable: true, isPopular: true },
  { id: 2, name: 'Paneer Tikka Crostini', category: 'Starters', price: 240, img: '/cheesecake.png', isVeg: true, rating: 4.9, prepTime: 10, desc: 'Smokey tandoori marinated cottage cheese on crusty herb toasted baguette.', isAvailable: true, isBestSeller: true },
  { id: 3, name: 'Truffle Margherita Pizza', category: 'Pizza', price: 420, img: '/cheesecake.png', isVeg: true, rating: 4.8, prepTime: 15, desc: 'Slow-fermented sourdough crust, San Marzano pomodoro, Fior di Latte, and basil oil.', isAvailable: true, isPopular: true },
  { id: 4, name: 'Smoked Farmhouse Pizza', category: 'Pizza', price: 460, img: '/cheesecake.png', isVeg: true, rating: 4.7, prepTime: 16, desc: 'Bell peppers, red onion, sun-dried tomatoes, roasted garlic, and mozzarella.', isAvailable: true },
  { id: 5, name: 'Double Brioche Crunch Burger', category: 'Burger', price: 280, img: '/croissant.png', isVeg: true, rating: 4.6, prepTime: 12, desc: 'Charred patty, smoked cheddar melting center, house pickles, and truffle aioli.', isAvailable: true, isBestSeller: true },
  { id: 6, name: 'Spicy Chipotle Veg Burger', category: 'Burger', price: 260, img: '/croissant.png', isVeg: true, rating: 4.5, prepTime: 11, desc: 'Crispy vegetable patty layered with smoky chipotle spread and crunchy iceberg.', isAvailable: true },
  { id: 7, name: 'Grilled Pesto Panini Sandwich', category: 'Sandwich', price: 250, img: '/croissant.png', isVeg: true, rating: 4.7, prepTime: 9, desc: 'Genovese basil pesto, buffalo mozzarella, and vine ripened heirloom tomatoes.', isAvailable: true },
  { id: 8, name: 'Creamy Alfredo Penne', category: 'Main Course', price: 380, img: '/croissant.png', isVeg: true, rating: 4.8, prepTime: 14, desc: 'Rich Parmesan cream sauce, roasted garlic florets, cracked pepper, and fresh parsley.', isAvailable: true, isPopular: true },
  { id: 9, name: 'Artisan Espresso', category: 'Beverages', price: 150, img: '/espresso.png', isVeg: true, rating: 4.8, prepTime: 5, desc: 'Rich double-shot extraction using hand-selected single-origin Arabica beans.', isAvailable: true, isPopular: true },
  { id: 10, name: 'Golden Crema Cappuccino', category: 'Beverages', price: 250, img: '/latte.png', isVeg: true, rating: 4.9, prepTime: 7, desc: 'Silky micro-foam, velvety espresso, and a delicate dusting of Valrhona cocoa.', isAvailable: true, isBestSeller: true },
  { id: 11, name: 'Iced Salted Caramel Frappé', category: 'Beverages', price: 280, img: '/latte.png', isVeg: true, rating: 4.7, prepTime: 6, desc: 'Chilled cold brew whipped with salted caramel, crushed ice, and Chantilly crema.', isAvailable: true, isBestSeller: true },
  { id: 12, name: 'Dark Chocolate Fudge Brownie', category: 'Desserts', price: 220, img: '/cheesecake.png', isVeg: true, rating: 4.9, prepTime: 4, desc: 'Warm 70% Belgian chocolate center topped with warm ganache and sea salt flakes.', isAvailable: true, isPopular: true },
  { id: 13, name: 'Vanilla Bean Cheesecake', category: 'Desserts', price: 350, img: '/cheesecake.png', isVeg: true, rating: 4.9, prepTime: 5, desc: 'Creamy Madagascar vanilla cheesecake resting on a buttery honey-graham crust.', isAvailable: true, isNew: true },
  { id: 14, name: 'Table Hive Fiesta Combo', category: 'Combos', price: 599, img: '/cappuccino.png', isVeg: true, rating: 4.9, prepTime: 15, desc: 'Choice of 1 Pizza + 1 Brioche Burger + 2 Iced Beverages. Perfect for sharing!', isAvailable: true, isBestSeller: true }
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [isClient, setIsClient] = useState(false);

  const [tableInfo, setTableInfo] = useState<TableInfo>({ tableNo: null });
  const [currentSession, setCurrentSession] = useState<TableSession | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const theme: ThemeMode = 'light';
  const [isPureVeg, setIsPureVeg] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(150);
  const [coffeeStamps, setCoffeeStamps] = useState(3);
  const [recentOrderTotal, setRecentOrderTotal] = useState(0);

  const [mockMenu, setMockMenu] = useState<MenuItem[]>(defaultMenu);
  const [adminTables, setAdminTables] = useState<TableRecord[]>([]);
  const [adminOrders, setAdminOrders] = useState<OrderRecord[]>([]);
  const [adminFeedback, setAdminFeedback] = useState<FeedbackRecord[]>([]);
  const [adminCustomers, setAdminCustomers] = useState<Array<any>>([]);
  const [adminPayments, setAdminPayments] = useState<PaymentRecord[]>([]);
  const [adminBookings, setAdminBookings] = useState<BookingRecord[]>([]);
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [serverIp, setServerIp] = useState('localhost');
  const [tunnelUrl, setTunnelUrl] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load state from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    try {
      const savedTable = localStorage.getItem('th_table');
      if (savedTable) setTableInfo(JSON.parse(savedTable));

      const savedSession = localStorage.getItem('th_session');
      if (savedSession) setCurrentSession(JSON.parse(savedSession));

      const savedUser = localStorage.getItem('th_user');
      if (savedUser) setUser(JSON.parse(savedUser));

      const savedAdmin = localStorage.getItem('th_admin');
      if (savedAdmin) setAdminUser(JSON.parse(savedAdmin));

      const savedCart = localStorage.getItem('th_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedOrderId = localStorage.getItem('th_order_id');
      if (savedOrderId) setCurrentOrderId(savedOrderId);

      const savedFavs = localStorage.getItem('th_favorites');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedPoints = localStorage.getItem('th_points');
      if (savedPoints) setLoyaltyPoints(parseInt(savedPoints, 10));

      const savedTotal = localStorage.getItem('th_recent_total');
      if (savedTotal) setRecentOrderTotal(parseFloat(savedTotal));

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlTable = params.get('table');
        if (urlTable) {
          setTableInfo(prev => ({ ...prev, tableNo: urlTable }));
        }
      }
    } catch (e) {
      console.error('Failed to load initial state:', e);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('th_table', JSON.stringify(tableInfo));
  }, [tableInfo, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('th_session', JSON.stringify(currentSession));
  }, [currentSession, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('th_user', JSON.stringify(user));
  }, [user, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('th_admin', JSON.stringify(adminUser));
  }, [adminUser, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('th_cart', JSON.stringify(cart));
  }, [cart, isClient]);

  useEffect(() => {
    if (!isClient) return;
    if (currentOrderId) localStorage.setItem('th_order_id', currentOrderId);
    else localStorage.removeItem('th_order_id');
  }, [currentOrderId, isClient]);

  // Toast System (Auto-removes in 1 second)
  const showToast = useCallback((message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const id = Date.now();
    setToasts([{ id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 1000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sync loop with backend
  useEffect(() => {
    if (!isClient) return;

    const fetchSync = async () => {
      try {
        const res = await fetch('/api/database/sync');
        if (res.ok) {
          const data = await res.json();
          if (data.orders) setAdminOrders(data.orders);
          if (data.tables) setAdminTables(data.tables);
          if (data.feedback) setAdminFeedback(data.feedback);
          if (data.customers) setAdminCustomers(data.customers);
          if (data.payments) setAdminPayments(data.payments);
          if (data.bookings) setAdminBookings(data.bookings);
          if (data.waiterCalls) setWaiterCalls(data.waiterCalls);
          if (data.menu && data.menu.length > 0) setMockMenu(data.menu);
          if (data.notifications) setNotifications(data.notifications);

          // If seated at a table, refresh current session
          if (tableInfo?.tableNo) {
            const tId = parseInt(String(tableInfo.tableNo));
            const active = (data.activeSessions || []).find((s: TableSession) => s.tableId === tId);
            if (active) {
              setCurrentSession(active);
              if (active.cart && active.cart.length > 0 && cart.length === 0) {
                setCart(active.cart);
              }
            }
          }
        }
      } catch (err) {}
    };

    const fetchIp = async () => {
      try {
        const res = await fetch('/api/get-ip');
        if (res.ok) {
          const data = await res.json();
          setServerIp(data.ip || 'localhost');
          if (data.tunnelUrl && !tunnelUrl) {
            setTunnelUrl(data.tunnelUrl);
          }
        }
      } catch (e) {}
    };

    fetchIp();
    fetchSync();
    const interval = setInterval(fetchSync, 4000);
    return () => clearInterval(interval);
  }, [isClient, tunnelUrl, tableInfo?.tableNo, cart.length]);

  // Track order status for customer view
  useEffect(() => {
    if (currentOrderId && adminOrders.length > 0) {
      const active = adminOrders.find(o => o.o === currentOrderId);
      if (active && active.s) {
        setOrderStatus(active.s);
      }
    }
  }, [adminOrders, currentOrderId]);

  // Table Session: Start or Join
  const startTableSession = async (tableNo: string | number, guestNames?: string[], count?: number): Promise<TableSession | null> => {
    try {
      const res = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: parseInt(String(tableNo)),
          guestNames: guestNames || [user?.n || 'Guest'],
          peopleCount: count || (guestNames ? guestNames.length : 1),
          customerEmail: user?.c || user?.email || '',
          customerName: user?.n || user?.name || 'Guest'
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentSession(data.session);
        setTableInfo(prev => ({
          ...prev,
          tableNo: String(tableNo),
          sessionId: data.session.sessionId,
          guestNames: data.session.members.map((m: any) => m.name),
          peopleCount: data.session.peopleCount,
        }));
        return data.session;
      }
    } catch (e) {
      console.error('Failed to start table session:', e);
    }
    return null;
  };

  // Table Session: End & Leave Table
  const endTableSession = async () => {
    if (currentSession?.sessionId) {
      try {
        await fetch(`/api/sessions/${currentSession.sessionId}/end`, { method: 'POST' });
      } catch (e) {}
    }
    localStorage.removeItem('th_table');
    localStorage.removeItem('th_session');
    localStorage.removeItem('th_cart');
    localStorage.removeItem('th_order_id');
    setTableInfo({ tableNo: null });
    setCurrentSession(null);
    setCart([]);
    setCurrentOrderId(null);
    setOrderStatus(null);
    showToast('Table session completed. Thank you for dining with Table Hive!', 'success');
  };

  // Table Session: Save Interests
  const setSessionInterests = async (interests: string[]) => {
    setTableInfo(prev => ({ ...prev, interests }));
    if (currentSession?.sessionId) {
      try {
        await fetch(`/api/sessions/${currentSession.sessionId}/interests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interests }),
        });
      } catch (e) {}
    }
  };

  // Invite Friend (Email Only)
  const sendEmailInvite = async (email: string): Promise<boolean> => {
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'warning');
      return false;
    }
    try {
      const res = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNo: tableInfo.tableNo || '1',
          sessionId: currentSession?.sessionId,
          email: email.trim(),
        }),
      });
      if (res.ok) {
        showToast(`Invitation delivered to ${email}! ✉️`, 'success');
        return true;
      }
    } catch (e) {
      showToast('Failed to send email invitation.', 'error');
    }
    return false;
  };

  const togglePureVeg = () => setIsPureVeg(prev => !prev);

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      if (isClient) localStorage.setItem('th_favorites', JSON.stringify(updated));
      showToast(exists ? 'Removed from favorites' : 'Saved to favorites ❤️', 'info');
      return updated;
    });
  };

  // Shared Cart Operations
  const addToCart = (product: MenuItem, customization?: ItemCustomization, forGuest?: string) => {
    const additional = customization?.additionalPrice || 0;
    const finalPrice = product.price + additional;
    const guestAttribution = forGuest || user?.n || tableInfo.guestNames?.[0] || 'Me';

    setCart(prev => {
      const customKey = JSON.stringify(customization || {});
      const existingIndex = prev.findIndex(item => 
        item.id === product.id && 
        JSON.stringify(item.customization || {}) === customKey &&
        (item.forGuest || '') === guestAttribution
      );

      let updated: CartItem[];
      if (existingIndex > -1) {
        updated = prev.map((item, idx) => 
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updated = [...prev, {
          ...product,
          price: finalPrice,
          quantity: 1,
          customization,
          forGuest: guestAttribution,
        }];
      }

      // Sync to backend session
      if (currentSession?.sessionId) {
        fetch(`/api/sessions/${currentSession.sessionId}/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart: updated }),
        }).catch(() => {});
      }

      return updated;
    });

    showToast(`${product.name} added to Table #${tableInfo.tableNo || '1'} cart (${guestAttribution})`, 'success');
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const updated = prev
        .map((item, idx) => (idx === index ? { ...item, quantity: item.quantity + delta } : item))
        .filter(item => item.quantity > 0);

      if (currentSession?.sessionId) {
        fetch(`/api/sessions/${currentSession.sessionId}/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart: updated }),
        }).catch(() => {});
      }
      return updated;
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (currentSession?.sessionId) {
        fetch(`/api/sessions/${currentSession.sessionId}/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart: updated }),
        }).catch(() => {});
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    if (currentSession?.sessionId) {
      fetch(`/api/sessions/${currentSession.sessionId}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: [] }),
      }).catch(() => {});
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Place Order Action
  const placeOrder = async (): Promise<string | null> => {
    if (cart.length === 0) return null;
    const orderId = `TH${Math.floor(1000 + Math.random() * 9000)}`;
    const totalWithGst = cartTotal + cartTotal * 0.08;

    const itemsDesc = cart.map(c => {
      const notes: string[] = [];
      if (c.forGuest) notes.push(`For: ${c.forGuest}`);
      if (c.customization?.milk) notes.push(c.customization.milk.split(' ')[0]);
      if (c.customization?.temperature) notes.push(c.customization.temperature.split(' ')[0]);
      const noteStr = notes.length > 0 ? ` (${notes.join(', ')})` : '';
      return `${c.quantity}x ${c.name}${noteStr}`;
    }).join(', ');

    const orderPayload: OrderRecord = {
      o: orderId,
      t: tableInfo?.tableNo ? String(tableInfo.tableNo) : 'Takeaway',
      i: itemsDesc,
      items: cart.map(c => ({
        id: c.id,
        name: c.name,
        quantity: c.quantity,
        price: c.price,
        forGuest: c.forGuest || 'Guest',
        customization: c.customization
      })),
      price: `₹${totalWithGst.toFixed(2)}`,
      s: 'New',
      rawAmount: totalWithGst,
      contact: user?.c || user?.contact || '',
      customerName: user?.n || user?.name || 'Customer',
      sessionId: currentSession?.sessionId,
      paymentStatus: 'Pending',
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch('/api/database/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      showToast(`Order #${orderId} confirmed! Sent to Kitchen 👨‍🍳`, 'success');
      
      const earned = Math.floor(cartTotal / 10);
      setLoyaltyPoints(p => {
        const u = p + earned;
        localStorage.setItem('th_points', u.toString());
        return u;
      });

      setRecentOrderTotal(totalWithGst);
      localStorage.setItem('th_recent_total', totalWithGst.toString());
      setCart([]);
      setCurrentOrderId(orderId);
      setOrderStatus('New');
      return orderId;
    } catch (err) {
      showToast('Error placing order. Please try again.', 'error');
      return null;
    }
  };

  // Record Payment (Paytm / Gateway / Split)
  const recordPayment = async (data: {
    orderId?: string;
    amount: number;
    method?: string;
    splitType?: 'full' | 'equal' | 'itemized';
    person?: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/payments/paytm/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txnToken: `PTM-${Date.now()}`,
          orderId: data.orderId || currentOrderId || 'TH-ORDER',
          amount: data.amount,
          tableNo: tableInfo.tableNo,
          customer: user?.n || 'Guest',
          method: data.method || 'Paytm',
          splitType: data.splitType || 'full',
          person: data.person || user?.n || 'Guest',
        }),
      });

      if (res.ok) {
        showToast(`Payment of ₹${data.amount.toFixed(2)} verified via ${data.method || 'Paytm'}! 🎉`, 'success');
        return true;
      }
    } catch (e) {
      showToast('Payment processing error.', 'error');
    }
    return false;
  };

  // Waiter Assistance
  const callWaiter = async (requestType: string = 'General Assistance'): Promise<boolean> => {
    if (!tableInfo?.tableNo) {
      showToast('Please check into your table first', 'warning');
      return false;
    }
    try {
      await fetch('/api/database/waiter-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tableId: tableInfo.tableNo,
          requestType,
        }),
      });
      showToast(`🛎️ Staff alerted for Table #${tableInfo.tableNo} (${requestType})`, 'success');
      return true;
    } catch (err) {
      showToast('Could not notify staff. Please call waiter directly.', 'error');
      return false;
    }
  };

  const resolveWaiterCall = async (callId: string) => {
    try {
      await fetch(`/api/database/waiter-calls/${callId}/resolve`, { method: 'POST' });
      showToast('Call resolved', 'info');
    } catch (e) {}
  };

  const addReservation = async (details: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/database/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });
      if (res.ok) {
        showToast('Table booking confirmed! 🎉', 'success');
        return true;
      }
    } catch (err) {}
    return false;
  };

  // Admin Actions
  const updateTableStatus = async (id: number, status: 'Free' | 'Occupied' | 'Reserved' | 'Ordering') => {
    try {
      await fetch(`/api/database/tables/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      showToast(`Table ${id} is now ${status}`, 'success');
    } catch (err) {}
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/database/orders/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      showToast(`Order #${id} marked as ${status}`, 'success');
    } catch (err) {}
  };

  const deleteOrder = async (id: string) => {
    try {
      await fetch(`/api/database/orders/${id}`, { method: 'DELETE' });
      showToast(`Order #${id} deleted`, 'info');
    } catch (err) {}
  };

  const createTable = async (seats: number) => {
    try {
      await fetch('/api/database/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats }),
      });
      showToast('New table created successfully.', 'success');
    } catch (err) {}
  };

  const deleteTable = async (id: number) => {
    try {
      await fetch(`/api/database/tables/${id}`, { method: 'DELETE' });
      showToast(`Table #${id} removed.`, 'info');
    } catch (err) {}
  };

  const updateMenuDish = async (dish: Partial<MenuItem>): Promise<boolean> => {
    try {
      if (dish.id) {
        await fetch(`/api/database/menu/${dish.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dish),
        });
      } else {
        await fetch('/api/database/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dish),
        });
      }
      showToast('Menu dish saved successfully!', 'success');
      return true;
    } catch (err) {
      showToast('Failed to save menu dish.', 'error');
      return false;
    }
  };

  const deleteMenuDish = async (id: number): Promise<boolean> => {
    try {
      await fetch(`/api/database/menu/${id}`, { method: 'DELETE' });
      showToast('Dish removed from menu.', 'info');
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleWipeDatabase = async () => {
    if (!window.confirm('Warning: This will reset all orders and tables. Continue?')) return;
    try {
      await fetch('/api/database/reset', { method: 'DELETE' });
      showToast('Database reset clean.', 'info');
    } catch (err) {}
  };

  const logoutCustomer = () => {
    endTableSession();
    setUser(null);
    localStorage.removeItem('th_user');
    showToast('Logged out successfully.', 'info');
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem('th_admin');
    showToast('Admin logged out.', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        tableInfo,
        setTableInfo,
        currentSession,
        startTableSession,
        endTableSession,
        setSessionInterests,
        sendEmailInvite,
        user,
        setUser,
        adminUser,
        setAdminUser,
        logoutCustomer,
        logoutAdmin,
        cart,
        setCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        placeOrder,
        orderStatus,
        setOrderStatus,
        currentOrderId,
        setCurrentOrderId,
        recentOrderTotal,
        recordPayment,
        theme,
        isPureVeg,
        togglePureVeg,
        favorites,
        toggleFavorite,
        loyaltyPoints,
        coffeeStamps,
        mockMenu,
        setMockMenu,
        updateMenuDish,
        deleteMenuDish,
        adminTables,
        adminOrders,
        adminFeedback,
        adminCustomers,
        adminPayments,
        adminBookings,
        waiterCalls,
        notifications,
        callWaiter,
        resolveWaiterCall,
        addReservation,
        updateTableStatus,
        updateOrderStatus,
        deleteOrder,
        createTable,
        deleteTable,
        handleWipeDatabase,
        serverIp,
        tunnelUrl,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

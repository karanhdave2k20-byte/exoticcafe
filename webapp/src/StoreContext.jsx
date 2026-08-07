import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  const [tableInfo, setTableInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('aura-table');
      return saved ? JSON.parse(saved) : { tableNo: null };
    } catch(err) { return { tableNo: null }; }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aura-user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.n === 'Google User' || parsed.c === 'google_user@gmail.com')) {
          const migrated = { ...parsed, n: 'Karan Dave', c: 'karanhdave2k20@gmail.com' };
          localStorage.setItem('aura-user', JSON.stringify(migrated));
          return migrated;
        }
        return parsed;
      }
      return null;
    } catch(err) { return null; }
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aura-admin');
      return saved ? JSON.parse(saved) : null;
    } catch(err) { return null; }
  });

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('aura-cart');
      return saved ? JSON.parse(saved) : [];
    } catch(err) { return []; }
  });
  
  const [orderStatus, setOrderStatus] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(() => localStorage.getItem('aura-order-id'));
  const [theme, setTheme] = useState(localStorage.getItem('aura-theme') || 'dark');

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  const [mediaPreference, setMediaPreference] = useState('All');
  const [adminTables, setAdminTables] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminCustomers, setAdminCustomers] = useState([]);
  const [adminPayments, setAdminPayments] = useState([]);
  const [recentOrderTotal, setRecentOrderTotal] = useState(() => {
    try {
      const saved = localStorage.getItem('aura-recent-total');
      return saved ? parseFloat(saved) : 0;
    } catch(err) { return 0; }
  });
  const [adminFeedback, setAdminFeedback] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [waiterCalls, setWaiterCalls] = useState([]);
  const [serverIp, setServerIp] = useState('localhost'); // Fallback to localhost
  const [tunnelUrl, setTunnelUrl] = useState(''); // Public Tunnel URL
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('aura-favorites');
      return saved ? JSON.parse(saved) : [];
    } catch(e) { return []; }
  });

  const [loyaltyPoints, setLoyaltyPoints] = useState(() => {
    try {
      const saved = localStorage.getItem('aura-loyalty-points');
      return saved ? parseInt(saved) : 150;
    } catch(e) { return 150; }
  });

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const updated = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      localStorage.setItem('aura-favorites', JSON.stringify(updated));
      showToast(prev.includes(productId) ? 'Removed from Favorites' : 'Added to Favorites ❤️', 'info');
      return updated;
    });
  };

  const addReservation = async (reservationDetails) => {
    try {
      const res = await fetch('/api/database/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationDetails)
      });
      if (res.ok) {
        showToast('Table reservation submitted successfully! 🎉', 'success');
        return true;
      }
    } catch(err) {
      showToast('Error booking table. Please try again.', 'error');
    }
    return false;
  };

  const [adminMenu, setAdminMenu] = useState([
    { id: 1, name: 'Premium Espresso', category: 'Coffee', price: 150, img: '/espresso.png', isVeg: true, rating: 4.8, prepTime: 5, desc: 'Rich and intense double-shot espresso brewed from premium Arabica beans.', discount: 10, isPopular: true, calories: '80 kcal', strength: 5, type: 'hot' },
    { id: 2, name: 'Golden Cappuccino', category: 'Coffee', price: 250, img: '/latte.png', isVeg: true, rating: 4.9, prepTime: 7, desc: 'Perfect balance of espresso, steamed milk, and a thick layer of foam with cocoa dust.', isBestSeller: true, calories: '190 kcal', strength: 3, type: 'hot' },
    { id: 3, name: 'Hazelnut Latte', category: 'Coffee', price: 300, img: '/latte.png', isVeg: true, rating: 4.7, prepTime: 8, desc: 'Classic espresso combined with steamed milk and a rich hazelnut infusion.', isNew: true, calories: '210 kcal', strength: 3, type: 'hot' },
    { id: 4, name: 'Classic Margherita Pizza', category: 'Pizza', price: 420, img: '/cheesecake.png', isVeg: true, rating: 4.8, prepTime: 15, desc: 'Fresh basil, rich marinara sauce, and gooey mozzarella cheese on a thin crust.', discount: 15, isPopular: true, calories: '680 kcal' },
    { id: 5, name: 'Double Cheese Crunch Burger', category: 'Burger', price: 280, img: '/croissant.png', isVeg: true, rating: 4.6, prepTime: 12, desc: 'Crispy veg patty, double slice cheddar cheese, fresh lettuce, and signature spicy mayo.', isBestSeller: true, calories: '520 kcal' },
    { id: 6, name: 'Chocolate Fudge Brownie', category: 'Dessert', price: 220, img: '/cheesecake.png', isVeg: true, rating: 4.9, prepTime: 4, desc: 'Warm, gooey chocolate fudge brownie topped with premium hot fudge sauce.', isPopular: true, calories: '340 kcal' },
    { id: 7, name: 'New York Cheesecake', category: 'Dessert', price: 350, img: '/cheesecake.png', isVeg: true, rating: 4.9, prepTime: 5, desc: 'Creamy, rich classic cheesecake base on a crumbly graham cracker crust.', isNew: true, calories: '410 kcal' },
    { id: 8, name: 'Iced Caramel Frappe', category: 'Cold Drinks', price: 280, img: '/latte.png', isVeg: true, rating: 4.7, prepTime: 6, desc: 'Blended espresso with milk, caramel syrup, crushed ice, whipped cream, and caramel drizzle.', isBestSeller: true, calories: '290 kcal', strength: 2, type: 'cold' },
    { id: 9, name: 'Avo-Toast & Poached Egg', category: 'Breakfast', price: 320, img: '/croissant.png', isVeg: false, rating: 4.5, prepTime: 10, desc: 'Sourdough toast layered with seasoned mashed avocado and topped with a poached egg.', isNew: true, calories: '310 kcal' },
    { id: 10, name: 'Cheese Garlic Bread', category: 'Fast Food', price: 190, img: '/croissant.png', isVeg: true, rating: 4.6, prepTime: 8, desc: 'Four pieces of toasted baguette brushed with garlic butter and melted mozzarella.', discount: 5, isPopular: true, calories: '240 kcal' }
  ]);
  const [isPureVeg, setIsPureVeg] = useState(false);
  const togglePureVeg = () => setIsPureVeg(prev => !prev);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('aura-table', JSON.stringify(tableInfo));
  }, [tableInfo]);

  useEffect(() => {
    localStorage.setItem('aura-user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('aura-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (currentOrderId) localStorage.setItem('aura-order-id', currentOrderId);
    else localStorage.removeItem('aura-order-id');
  }, [currentOrderId]);

  useEffect(() => {
    localStorage.setItem('aura-recent-total', recentOrderTotal.toString());
  }, [recentOrderTotal]);

  // Handle automatic order status updates from syncing
  useEffect(() => {
    if (currentOrderId && adminOrders && adminOrders.length > 0) {
      const myOrder = adminOrders.find(o => o.o === currentOrderId);
      if (myOrder) {
        // Map backend status to frontend stages
        const statusMap = {
          'Preparing': 'preparing',
          'Ready': 'ready',
          'Delivered': 'delivered',
          'Completed': 'delivered'
        };
        setOrderStatus(statusMap[myOrder.s] || 'received');
      }
    }
  }, [adminOrders, currentOrderId]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aura-theme', theme);
  }, [theme]);

  // Real-Time Cross-Device Polling Setup
  useEffect(() => {
    const fetchRealTimeDatabase = async () => {
      try {
        const url = `/api/database/sync`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setAdminOrders(data.orders);
          setAdminTables(data.tables);
          setAdminFeedback(data.feedback);
          setAdminCustomers(data.customers || []);
          setAdminPayments(data.payments || []);
          setAdminBookings(data.bookings || []);
          setWaiterCalls(data.waiterCalls || []);
        }
      } catch (err) {
        console.error("Real-time sync error. Is server.js running?");
      }
    };
    
    // Fetch Server IP for QR Code Generation
    const fetchServerIp = async () => {
      try {
        const res = await fetch('/api/get-ip');
        if (res.ok) {
          const data = await res.json();
          setServerIp(data.ip || 'localhost');
          if (data.tunnelUrl && !localStorage.getItem('aura-tunnel')) {
             setTunnelUrl(data.tunnelUrl);
          }
        }
      } catch(err) {
        console.warn("Could not fetch server IP. Localhost fallback active.");
      }
    };

    // Handle table in URL
    const params = new URLSearchParams(window.location.search);
    const urlTable = params.get('table');
    if (urlTable) {
       setTableInfo({ tableNo: urlTable });
    }

    fetchServerIp();
    fetchRealTimeDatabase(); // Initial fetch
    // Pole every 5 seconds (Optimized from 2s)
    const interval = setInterval(fetchRealTimeDatabase, 5000); 
    return () => clearInterval(interval);
  }, []);

  // Sync status for the active order from the backend
  useEffect(() => {
    if (currentOrderId && adminOrders.length > 0) {
      const activeOrder = adminOrders.find(o => o.o === currentOrderId);
      if (activeOrder && activeOrder.s) {
         // Standardize status names if they differ
         const statusMap = {
           'Preparing': 'preparing',
           'Ready': 'ready',
           'Completed': 'delivered',
           'Ready to Serve': 'ready'
         };
         setOrderStatus(statusMap[activeOrder.s] || activeOrder.s.toLowerCase());
      }
    }
  }, [adminOrders, currentOrderId]);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    const orderId = Math.floor(1000 + Math.random() * 9000).toString();
    const newOrder = {
      o: orderId,
      t: tableInfo?.tableNo || 'Takeaway',
      i: cart.map(c => `${c.quantity}x ${c.name}`).join(', '),
      price: `₹${cartTotal + cartTotal * 0.08}`,
      s: 'Preparing',
      rawAmount: cartTotal + cartTotal * 0.08,
      contact: user?.contact || user?.c || '' // Link order to customer contact
    };
    
    // Physically push to Backend REST API so the Admin on a different computer sees it!
    try {
      const url = `/api/database/orders`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      showToast('Order placed successfully! 🎉', 'success');
      // Add loyalty points (10 points per ₹100 spent)
      const pointsEarned = Math.floor(cartTotal / 10);
      setLoyaltyPoints(prev => {
        const updated = prev + pointsEarned;
        localStorage.setItem('aura-loyalty-points', updated.toString());
        return updated;
      });
    } catch(err) { 
      console.error("Could not send order to realtime server");
      showToast('Error placing order. Please try again.', 'error');
    }

    setRecentOrderTotal(cartTotal + (cartTotal * 0.08));
    setCart([]); // Cart formally emptied so user can start a fresh order later
    setCurrentOrderId(orderId);
    setOrderStatus('received');
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`${product.name} added to cart`, 'success');
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts([{ id, message, type }]); // Replace instead of append for Singleton Toast
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const callWaiter = async () => {
    if (!tableInfo?.tableNo) return;
    try {
      await fetch('/api/database/waiter-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId: tableInfo.tableNo })
      });
      showToast('Waiter called! They will be with you shortly.', 'success');
    } catch(err) { showToast('Error calling waiter.', 'error'); }
  };

  const updateTableStatus = async (id, status) => {
    try {
      await fetch(`/api/database/tables/${id}/status`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      showToast(`Table ${id} is now ${status}`, 'success');
    } catch(err) { showToast('Error updating table.', 'error'); }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await fetch(`/api/database/orders/${id}/status`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      showToast(`Order #${id} is ${status}`, 'success');
    } catch(err) { showToast('Error updating order.', 'error'); }
  };

  const deleteOrder = async (id) => {
    try {
      await fetch(`/api/database/orders/${id}`, { method: 'DELETE' });
      showToast(`Order #${id} deleted`, 'info');
    } catch(err) { showToast('Error deleting order.', 'error'); }
  };

  const handleWipeDatabase = async () => {
    if (!window.confirm("Are you sure? This will wipe EVERYTHING.")) return;
    try {
      await fetch('/api/database/reset', { method: 'DELETE' });
      showToast('Database wiped clean.', 'info');
    } catch(err) { showToast('Error resetting database.', 'error'); }
  };

  const createTable = async (seats) => {
    try {
      await fetch('/api/database/tables', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats })
      });
      showToast('New table created.', 'success');
    } catch(err) { showToast('Error creating table.', 'error'); }
  };

  const deleteCustomerProfile = async (contact) => {
    try {
      await fetch(`/api/database/customers/${contact}`, { method: 'DELETE' });
      showToast('Customer profile deleted.', 'info');
    } catch(err) { showToast('Error deleting customer.', 'error'); }
  };

  return (
    <StoreContext.Provider value={{
      tableInfo, setTableInfo,
      user, setUser, 
    adminUser, setAdminUser,
    cart, setCart, 
addToCart, updateQuantity, removeFromCart, cartTotal, placeOrder,
      orderStatus, setOrderStatus,
      mockMenu: adminMenu, 
      adminTables, setAdminTables,
      adminOrders, setAdminOrders,
      adminMenu, setAdminMenu,
      adminFeedback, setAdminFeedback,
      adminCustomers, setAdminCustomers,
      adminPayments, setAdminPayments,
      adminBookings, setAdminBookings,
      waiterCalls, setWaiterCalls,
      callWaiter,
      updateTableStatus, updateOrderStatus, deleteOrder,
      handleWipeDatabase, createTable, deleteCustomerProfile,
      mediaPreference, setMediaPreference,
      recentOrderTotal,
      currentOrderId, setCurrentOrderId,
      theme, toggleTheme,
      showToast,
      serverIp,
      tunnelUrl, setTunnelUrl,
      isPureVeg, togglePureVeg,
      favorites, setFavorites, toggleFavorite,
      loyaltyPoints, setLoyaltyPoints,
      addReservation
    }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <Toast 
            key={t.id} 
            message={t.message} 
            type={t.type} 
            onClose={() => removeToast(t.id)} 
          />
        ))}
      </div>
    </StoreContext.Provider>
  );
};

import Toast from './components/Toast';


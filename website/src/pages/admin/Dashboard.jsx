import React, { useState } from 'react';
import { 
  Users, Coffee, ClipboardList, Star, Settings, Layout, 
  Trash2, Plus, LogOut, CheckCircle, Clock, AlertCircle, 
  Smartphone, UserPlus, CreditCard, Calendar, Bell, CookingPot, Edit, MessageSquare,
  Edit3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../../StoreContext';
import Modal from '../../components/Modal';

export default function Dashboard() {
  const { 
    adminTables, adminOrders, adminFeedback, adminCustomers, 
    adminPayments, adminBookings, waiterCalls, adminMenu, serverIp, tunnelUrl,
    updateTableStatus, updateOrderStatus, deleteOrder, 
    handleWipeDatabase, createTable, deleteCustomerProfile,
    showToast, setAdminMenu, setAdminTables, setAdminUser,
    adminUser
  } = useStore();

  const isStaff = adminUser?.r === 'staff';
  const [activeTab, setActiveTab] = useState(isStaff ? 'Kitchen' : 'Overview');
  const [isAddBookingModalOpen, setIsAddBookingModalOpen] = useState(false);
  const [newBookingData, setNewBookingData] = useState({ tableId: '', customerName: '', time: '' });
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);
  const [newTableSeats, setNewTableSeats] = useState('');
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);
  const [newDishData, setNewDishData] = useState({ id: null, name: '', price: '', category: 'Drinks', img: '' });

  // Universal Modal State for Admin Actions
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'danger' });
  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  const allTabs = [
    { name: 'Overview', icon: Layout },
    { name: 'Kitchen', icon: CookingPot },
    { name: 'Tables', icon: Coffee },
    { name: 'Orders', icon: ClipboardList },
    { name: 'Menu', icon: Coffee },
    { name: 'Waiter Alerts', icon: Bell },
    { name: 'Customers', icon: Users },
    { name: 'Payments', icon: CreditCard },
    { name: 'Bookings', icon: Calendar },
    { name: 'Feedback', icon: Star },
    { name: 'Settings', icon: Settings },
  ];

  const staffAllowed = ['Kitchen', 'Orders', 'Waiter Alerts'];
  const tabs = isStaff ? allTabs.filter(t => staffAllowed.includes(t.name)) : allTabs;

  const resolveWaiterCall = async (id) => {
    try {
      await fetch(`/api/database/waiter-calls/${id}/resolve`, { method: 'POST' });
      showToast('Waiter call resolved!', 'success');
    } catch(err) { console.error(err); }
  };

  const triggerAddDishModal = () => {
    setNewDishData({ id: null, name: '', price: '', category: 'Drinks', img: '' });
    setIsAddMenuModalOpen(true);
  };

  const triggerEditDishModal = (item) => {
    setNewDishData({ id: item.id, name: item.name, price: item.price.toString(), category: item.category, img: item.img || '' });
    setIsAddMenuModalOpen(true);
  };

  const handleDeleteDish = (id) => {
    setModal({
      isOpen: true,
      title: 'Delete Dish?',
      message: 'Are you sure you want to permanently delete this dish from the menu?',
      onConfirm: () => {
        setAdminMenu(adminMenu.filter(m => m.id !== id));
        showToast('Dish removed from menu.', 'info');
        closeModal();
      },
      type: 'danger'
    });
  };

  const confirmAddDish = () => {
    if (!newDishData.name || !newDishData.price) return;
    const configuredImg = newDishData.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(newDishData.name)}&background=d4a373&color=0d0d0d`;
    if (newDishData.id) {
       setAdminMenu(adminMenu.map(dish => dish.id === newDishData.id ? { ...dish, name: newDishData.name, price: parseInt(newDishData.price), category: newDishData.category, img: configuredImg } : dish));
       showToast('Dish updated!', 'success');
    } else {
       const newDish = { id: adminMenu.length + 1, name: newDishData.name, category: newDishData.category, price: parseInt(newDishData.price), img: configuredImg };
       setAdminMenu([newDish, ...adminMenu]);
       showToast('New dish added!', 'success');
    }
    setIsAddMenuModalOpen(false);
  };

  const confirmAddBooking = async () => {
    if (newBookingData.tableId && newBookingData.customerName && newBookingData.time) {
      await fetch(`/api/database/bookings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newBookingData, tableId: parseInt(newBookingData.tableId) })
      });
      setIsAddBookingModalOpen(false);
      setNewBookingData({ tableId: '', customerName: '', time: '' });
      showToast('Booking added!', 'success');
    }
  };

  const confirmAddTable = async () => {
    if (newTableSeats > 0) {
      createTable(parseInt(newTableSeats));
      setIsAddTableModalOpen(false);
      setNewTableSeats('');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="animate-fade-in">
            <h2 style={{ marginBottom: '2rem', color: 'var(--primary-color)' }}>Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              {[
                { label: 'Total Orders', value: adminOrders.length, color: '#ff9f1c' },
                { label: 'Today Sales', value: `₹${adminOrders.reduce((sum, o) => sum + (o.rawAmount || 0), 0).toFixed(0)}`, color: '#2ec4b6' },
                { label: 'Active Tables', value: `${adminTables.filter(t=>t.status!=='Free').length} / ${adminTables.length}`, color: '#e71d36' },
                { label: 'Avg Rating', value: adminFeedback.length > 0 ? `${(adminFeedback.reduce((sum, f) => sum + f.rating, 0) / adminFeedback.length).toFixed(1)} ⭐` : 'N/A', color: '#ffbf69' }
              ].map((stat, i) => (
                <div key={i} className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${stat.color}` }}>
                  <p style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                  <h3 style={{ fontSize: '2rem', margin: '0.5rem 0 0 0' }}>{stat.value}</h3>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Weekly Revenue Graph (₹)</h3>
                <div style={{ height: '300px', minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Mon', revenue: 4200 }, { name: 'Tue', revenue: 3100 },
                      { name: 'Wed', revenue: 5500 }, { name: 'Thu', revenue: 4550 },
                      { name: 'Fri', revenue: 8000 }, { name: 'Sat', revenue: 9500 },
                      { name: 'Sun', revenue: 7050 }
                    ]}>
                      <XAxis dataKey="name" stroke="var(--text-muted)" />
                      <YAxis stroke="var(--text-muted)" />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: 'none' }} />
                      <Bar dataKey="revenue" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Status Feed</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ padding: '1.5rem', background: 'rgba(74, 222, 128, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Live Tables</p>
                        <h3 style={{ fontSize: '2rem', margin: '0.5rem 0', color: '#4ade80' }}>{adminTables.filter(t => t.status === 'Occupied').length} / {adminTables.length}</h3>
                    </div>
                    <div style={{ padding: '1.5rem', background: waiterCalls.length > 0 ? 'rgba(255, 60, 60, 0.1)' : 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: waiterCalls.length > 0 ? '1px solid var(--danger-color)' : '1px solid var(--border-color)' }}>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Waiter Calls</p>
                        <h3 style={{ fontSize: '2rem', margin: '0.5rem 0', color: waiterCalls.length > 0 ? 'var(--danger-color)' : 'var(--text-main)' }}>{waiterCalls.length}</h3>
                    </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Kitchen':
        return (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {adminOrders.filter(o => o.s === 'Preparing').length === 0 ? (
              <div className="glass-panel" style={{ gridColumn: '1/-1', padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CookingPot size={64} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
                <h3 style={{ fontSize: '1.5rem' }}>No active orders in the kitchen.</h3>
              </div>
            ) : adminOrders.filter(o => o.s === 'Preparing').map(order => (
              <div key={order.o} className="glass-panel" style={{ borderTop: '6px solid var(--primary-color)', padding: '1.5rem', position: 'relative' }}>
                <div style={{ position:'absolute', top:'1rem', right:'1rem', color:'var(--text-muted)', fontSize:'0.8rem' }}>{new Date(order.createdAt).toLocaleTimeString() !== 'Invalid Date' ? new Date(order.createdAt).toLocaleTimeString() : 'Recent'}</div>
                <h3 style={{ margin: '0 0 1rem 0' }}>Table {order.t}</h3>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', minHeight: '100px' }}>
                   {order.i.split(',').map((item, idx) => (
                     <div key={idx} style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 500 }}>• {item.trim()}</div>
                   ))}
                </div>
                <button onClick={() => updateOrderStatus(order.o, 'Completed')} className="btn btn-primary btn-block" style={{ height: '50px', fontSize: '1.1rem' }}>
                  Mark as Ready
                </button>
              </div>
            ))}
          </div>
        );

      case 'Tables':
        return (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                   <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>Visual Heatmap</h2>
                   <button className="btn btn-primary" onClick={() => setIsAddTableModalOpen(true)}><Plus size={16}/> New Table</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1.5rem' }}>
                   {adminTables.map(t => (
                     <div key={t.id} style={{ 
                        padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', position: 'relative',
                        background: t.status === 'Occupied' ? 'rgba(255, 60, 60, 0.1)' : 'rgba(74, 222, 128, 0.1)',
                        border: `2px solid ${t.status === 'Occupied' ? 'var(--danger-color)' : '#4ade80'}`
                     }}>
                        <Coffee size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                        <h4 style={{ margin: 0 }}>Table {t.id}</h4>
                        <p style={{ margin: '0.5rem 0', fontSize: '0.8rem', fontWeight: 'bold', color: t.status === 'Occupied' ? 'var(--danger-color)' : '#4ade80' }}>{t.status}</p>
                        {t.status === 'Occupied' && t.guestNames && t.guestNames.length > 0 ? (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-main)', opacity: 0.9 }}>
                             <strong style={{ color: 'var(--primary-color)', fontSize: '0.8rem' }}>👤 {t.guestNames.length} People</strong>
                             <div style={{ marginTop: '0.3rem', fontSize: '0.7rem', opacity: 0.7 }}>
                               {t.guestNames.map(g => g.split(' (')[0]).join(', ')}
                             </div>
                          </div>
                        ) : (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-main)', opacity: 0.5 }}>
                             Empty
                          </div>
                        )}
                        <button onClick={() => updateTableStatus(t.id, t.status === 'Free' ? 'Occupied' : 'Free')} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                           <Edit3 size={14} />
                        </button>
                     </div>
                   ))}
                </div>
             </div>

             <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '1rem' }}>ID</th>
                      <th style={{ padding: '1rem' }}>Capacity</th>
                      <th style={{ padding: '1rem' }}>Occupancy</th>
                      <th style={{ padding: '1rem' }}>Guest Names (Preferences)</th>
                      <th style={{ padding: '1rem' }}>QR Link</th>
                      <th style={{ padding: '1rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminTables.map(t => {
                       const host = tunnelUrl ? tunnelUrl.replace(/^https?:\/\//, '') : ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? `${serverIp}:5173` : window.location.host);
                       const url = tunnelUrl ? `${tunnelUrl}/table/${t.id}` : `http://${host}/table/${t.id}`;
                       return (
                        <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem', fontWeight: 'bold' }}>#{t.id}</td>
                          <td style={{ padding: '1rem' }}>{t.seats || 4} Seats</td>
                          <td style={{ padding: '1rem' }}>
                            {t.status === 'Occupied' && t.guestNames?.length > 0 ? (
                               <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{t.guestNames.length} People</span>
                            ) : '-'}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{t.guestNames && t.guestNames.length > 0 ? t.guestNames.join(', ') : '-'}</td>
                          <td style={{ padding: '1rem' }}>
                            <a href={url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', fontSize: '0.8rem' }}>{url}</a>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${encodeURIComponent(url)}`} style={{ borderRadius: '4px', background: 'white', padding: '2px' }} alt="QR" />
                          </td>
                        </tr>
                       );
                    })}
                  </tbody>
                </table>
             </div>
          </div>
        );

      case 'Orders':
        return (
          <div className="animate-fade-in glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Master Order Log</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem' }}>ID</th>
                  <th style={{ padding: '1rem' }}>Table</th>
                  <th style={{ padding: '1rem' }}>Items</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Amount</th>
                  <th style={{ padding: '1rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {adminOrders.map(o => (
                  <tr key={o.o} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>#{o.o}</td>
                    <td style={{ padding: '1rem' }}>{o.t}</td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{o.i}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', background: o.s === 'Completed' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(212, 163, 115, 0.1)', color: o.s === 'Completed' ? '#4ade80' : 'var(--primary-color)', fontSize: '0.8rem' }}>{o.s}</span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>₹{o.rawAmount?.toFixed(0)}</td>
                    <td style={{ padding: '1rem' }}>
                        <button className="btn-icon" onClick={() => deleteOrder(o.o)}><Trash2 size={16} color="var(--danger-color)"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'Menu':
        return (
          <div className="animate-fade-in glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>Menu Catalog</h2>
              <button className="btn btn-primary" onClick={triggerAddDishModal}><Plus size={16}/> Add Item</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
               {adminMenu.map(item => (
                 <div key={item.id} className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                    <img src={item.img} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }} alt={item.name} />
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>{item.name}</h4>
                    <p style={{ color: 'var(--primary-color)', fontWeight: 'bold', margin: '0 0 1rem 0' }}>₹{item.price}</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                       <button className="btn btn-outline btn-block" onClick={() => triggerEditDishModal(item)}><Edit size={14}/></button>
                       <button className="btn btn-outline btn-block" style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }} onClick={() => handleDeleteDish(item.id)}><Trash2 size={14}/></button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        );

      case 'Waiter Alerts':
        return (
          <div className="animate-fade-in glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Live Table Notifications</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
               {waiterCalls.length === 0 ? (
                 <div style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Bell size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>No active service requests.</p>
                 </div>
               ) : waiterCalls.map(call => (
                 <div key={call._id} className="glass-panel" style={{ padding: '2rem', textAlign: 'center', border: '1px solid var(--danger-color)', background: 'rgba(255, 60, 60, 0.05)' }}>
                    <AlertCircle size={40} color="var(--danger-color)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ margin: '0 0 1.5rem 0' }}>Table {call.tableId}</h3>
                    <button onClick={() => resolveWaiterCall(call._id)} className="btn btn-primary btn-block">
                        Mark Resolved
                    </button>
                 </div>
               ))}
            </div>
          </div>
        );

      case 'Customers':
        return (
          <div className="animate-fade-in glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Customer Insights</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>Contact</th>
                  <th style={{ padding: '1rem' }}>Visits</th>
                  <th style={{ padding: '1rem' }}>LTV</th>
                  <th style={{ padding: '1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminCustomers.map(c => (
                  <tr key={c.c || c.contact} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{c.n || c.name || 'Unknown'}</td>
                    <td style={{ padding: '1rem' }}>{c.c || c.contact}</td>
                    <td style={{ padding: '1rem' }}>{c.v || c.visits || 0}</td>
                    <td style={{ padding: '1rem', color: 'var(--primary-color)' }}>₹{ (c.l || c.ltv || 0).toFixed(0) }</td>
                    <td style={{ padding: '1rem' }}>
                        <button className="btn-icon" onClick={() => deleteCustomerProfile(c.c || c.contact)}><Trash2 size={16} color="var(--danger-color)"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'Payments':
        return (
          <div className="animate-fade-in glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Transaction History</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem' }}>Order ID</th>
                  <th style={{ padding: '1rem' }}>Method</th>
                  <th style={{ padding: '1rem' }}>Amount</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {adminPayments.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No payment records found.</td></tr>
                ) : adminPayments.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>#{p.rel || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>{p.method}</td>
                    <td style={{ padding: '1rem', color: 'var(--primary-color)' }}>₹{p.amount}</td>
                    <td style={{ padding: '1rem' }}>
                       <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', fontSize: '0.8rem' }}>{p.status}</span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'Bookings':
        return (
          <div className="animate-fade-in glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
               <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>Table Reservations</h2>
               <button className="btn btn-primary" onClick={() => setIsAddBookingModalOpen(true)}><Plus size={16}/> New Booking</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem' }}>Customer</th>
                  <th style={{ padding: '1rem' }}>Table</th>
                  <th style={{ padding: '1rem' }}>Time</th>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Created At</th>
                </tr>
              </thead>
              <tbody>
                {adminBookings.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No bookings found.</td></tr>
                ) : adminBookings.map((b, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{b.customerName}</td>
                    <td style={{ padding: '1rem' }}>Table {b.tableId}</td>
                    <td style={{ padding: '1rem' }}>{b.time}</td>
                    <td style={{ padding: '1rem' }}>{b.date || 'Today'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(b.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'Feedback':
        return (
          <div className="animate-fade-in glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Reviews & Suggestions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {adminFeedback.map((f, i) => (
                 <div key={i} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                       <span style={{ fontWeight: 'bold' }}>{f.user}</span>
                       <span style={{ color: 'var(--primary-color)' }}>{'⭐'.repeat(f.rating)}</span>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>"{f.msg}"</p>
                 </div>
               ))}
            </div>
          </div>
        );

       case 'Settings':
        return (
          <div className="animate-fade-in glass-panel" style={{ padding: '2rem', maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>System Config</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div>
                 <label style={{ display:'block', marginBottom:'0.5rem', color:'var(--text-muted)' }}>Cafe Name</label>
                 <input type="text" defaultValue="Exotic Café & Bistro" />
               </div>
               <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
               <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255, 60, 60, 0.2)', paddingTop: '1.5rem' }}>
                  <h3 style={{ color: 'var(--danger-color)' }}>Danger Zone</h3>
                  <button onClick={handleWipeDatabase} className="btn" style={{ border: '1px solid var(--danger-color)', color: 'var(--danger-color)', marginTop: '1rem' }}>Reset Whole Database</button>
               </div>
            </div>
          </div>
        );

      default: return <div style={{ padding: '5rem', textAlign: 'center' }}>Coming Soon...</div>;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-color)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2.5rem 1.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', fontFamily: 'var(--font-serif)', margin: 0 }}>
             EXOTIC <span style={{ color: 'var(--text-main)' }}>{isStaff ? 'KITCHEN' : 'MANAGER'}</span>
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{adminUser?.n}</p>
        </div>
        <nav style={{ flex: 1, padding: '0 1rem', overflowY: 'auto' }}>
          {tabs.map(tab => (
            <button key={tab.name} onClick={() => setActiveTab(tab.name)} style={{
              display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', padding: '1rem', marginBottom: '0.4rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
              background: activeTab === tab.name ? 'rgba(212, 163, 115, 0.15)' : 'transparent',
              color: activeTab === tab.name ? 'var(--primary-color)' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}>
              <tab.icon size={20} />
              <span style={{ fontWeight: activeTab === tab.name ? 'bold' : 'normal' }}>{tab.name}</span>
            </button>
          ))}
          <button onClick={() => {
              setAdminUser(null);
              localStorage.removeItem('aura-admin');
              showToast('Logged out from Admin Panel', 'info');
              // The ProtectedRoute will automatically redirect to /admin/login
            }} style={{
              display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', padding: '1rem', marginTop: 'auto', marginBottom: '1rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
              color: 'var(--danger-color)', transition: 'all 0.2s'
            }}>
              <LogOut size={20} />
              <span>Log Out</span>
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto', background: 'linear-gradient(180deg, rgba(212, 163, 115, 0.05), transparent)' }}>
        {renderTabContent()}
      </div>

      {/* Modals */}
      <Modal isOpen={isAddMenuModalOpen} onClose={() => setIsAddMenuModalOpen(false)} title={newDishData.id ? "Edit Item" : "Add Item"}>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
            <input placeholder="Name" value={newDishData.name} onChange={e => setNewDishData({...newDishData, name: e.target.value})} />
            <input placeholder="Price" type="number" value={newDishData.price} onChange={e => setNewDishData({...newDishData, price: e.target.value})} />
            <select value={newDishData.category} onChange={e => setNewDishData({...newDishData, category: e.target.value})}>
               <option>Drinks</option><option>Snacks</option><option>Dessert</option>
            </select>
            <button className="btn btn-primary" onClick={confirmAddDish}>Save Dish</button>
         </div>
      </Modal>

      <Modal isOpen={isAddTableModalOpen} onClose={() => setIsAddTableModalOpen(false)} title="New Table">
         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
            <input placeholder="Seats" type="number" value={newTableSeats} onChange={e => setNewTableSeats(e.target.value)} />
            <button className="btn btn-primary" onClick={confirmAddTable}>Confirm</button>
         </div>
      </Modal>

      <Modal isOpen={isAddBookingModalOpen} onClose={() => setIsAddBookingModalOpen(false)} title="Add Table Reservation">
         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
            <input placeholder="Customer Name" value={newBookingData.customerName} onChange={e => setNewBookingData({...newBookingData, customerName: e.target.value})} />
            <input placeholder="Table Number" type="number" value={newBookingData.tableId} onChange={e => setNewBookingData({...newBookingData, tableId: e.target.value})} />
            <input placeholder="Time (e.g. 7:30 PM)" value={newBookingData.time} onChange={e => setNewBookingData({...newBookingData, time: e.target.value})} />
            <button className="btn btn-primary" onClick={confirmAddBooking}>Confirm Booking</button>
         </div>
      </Modal>

      <Modal isOpen={modal.isOpen} onClose={closeModal} title={modal.title} message={modal.message} type={modal.type} onConfirm={modal.onConfirm} />
    </div>
  );
}

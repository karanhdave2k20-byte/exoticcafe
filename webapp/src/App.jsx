import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore } from './StoreContext';
import QRScan from './pages/customer/QRScan';
import Login from './pages/customer/Login';
import Feedback from './pages/customer/Feedback';
import Menu from './pages/customer/Menu';
import Cart from './pages/customer/Cart';
import Fun from './pages/customer/Fun';
import TrackOrder from './pages/customer/TrackOrder';
import Payment from './pages/customer/Payment';
import Suggestion from './pages/customer/Suggestion';
import ThankYou from './pages/customer/ThankYou';
import AdminDashboard from './pages/admin/Dashboard';
import News from './pages/customer/games/News';
import Game2048 from './pages/customer/games/Game2048';
import Films from './pages/customer/games/Films';
import Radio from './pages/customer/games/Radio';
import LiveScore from './pages/customer/games/LiveScore';
import ThemeToggle from './components/ThemeToggle';
import BackButton from './components/BackButton';
import PreferencePage from './pages/customer/PreferencePage';
import MediaSuggestion from './pages/customer/MediaSuggestion';
import AdminLogin from './pages/admin/AdminLogin';
import AdminSignup from './pages/admin/AdminSignup';
import Scanner from './pages/customer/Scanner';
import PeopleCount from './pages/customer/PeopleCount';
import InviteFriends from './pages/customer/InviteFriends';

function ProtectedRoute({ children }) {
  const { user, tableInfo } = useStore();
  const location = useLocation();
  
  if (!user && !location.pathname.startsWith('/admin')) {
    if (tableInfo?.tableNo) {
       return <Navigate to="/login" replace />;
    }
    return <Navigate to="/" replace />;
  }
  return children;
}

function StaffProtectedRoute({ children }) {
  const { adminUser } = useStore();
  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <ThemeToggle />
      <Routes>
        {/* Onboarding sequence starts directly on the QR scanner */}
        <Route path="/" element={<Scanner />} />
        <Route path="/scanner" element={<Navigate to="/" replace />} />
        <Route path="/table/:id" element={<QRScan />} />
        <Route path="/people" element={<PeopleCount />} />
        <Route path="/invite" element={<ProtectedRoute><InviteFriends /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
        <Route path="/media-suggest" element={<ProtectedRoute><MediaSuggestion /></ProtectedRoute>} />
        <Route path="/preference" element={<ProtectedRoute><PreferencePage /></ProtectedRoute>} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/fun" element={<ProtectedRoute><Fun /></ProtectedRoute>} />
        <Route path="/fun/game" element={<ProtectedRoute><Game2048 /></ProtectedRoute>} />
        <Route path="/fun/films" element={<ProtectedRoute><Films /></ProtectedRoute>} />
        <Route path="/fun/radio" element={<ProtectedRoute><Radio /></ProtectedRoute>} />
        <Route path="/fun/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
        <Route path="/fun/live" element={<ProtectedRoute><LiveScore /></ProtectedRoute>} />
        <Route path="/track" element={<ProtectedRoute><TrackOrder /></ProtectedRoute>} />
        <Route path="/pay" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/suggest" element={<ProtectedRoute><Suggestion /></ProtectedRoute>} />
        <Route path="/thanks" element={<ProtectedRoute><ThankYou /></ProtectedRoute>} />

        {/* Admin Dashboard */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin" element={<StaffProtectedRoute><AdminDashboard /></StaffProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import SearchSalons from './pages/customer/SearchSalons';
import SalonDetails from './pages/customer/SalonDetails';
import Booking from './pages/customer/Booking';
import Payment from './pages/customer/Payment';
import BookingHistory from './pages/customer/BookingHistory';
import Favorites from './pages/customer/Favorites';
import Profile from './pages/customer/Profile';
import Notifications from './pages/customer/Notifications';
import AIHairstyle from './pages/customer/AIHairstyle';

import OwnerDashboard from './pages/owner/Dashboard';
import SalonManagement from './pages/owner/SalonManagement';
import SalonSetup from './pages/owner/SalonSetup';
import BarberManagement from './pages/owner/BarberManagement';
import ServiceManagement from './pages/owner/ServiceManagement';
import SlotManagement from './pages/owner/SlotManagement';
import OwnerBookings from './pages/owner/Bookings';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSalons from './pages/admin/AdminSalons';
import AdminReviews from './pages/admin/AdminReviews';
import AdminPayments from './pages/admin/AdminPayments';
import AdminSettings from './pages/admin/AdminSettings';

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: '#1E293B', color: '#F8F7F4', border: '1px solid rgba(212,175,55,0.25)' },
            success: { iconTheme: { primary: '#D4AF37', secondary: '#0F172A' } },
          }}
        />
        <AppLayout>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/salons" element={<SearchSalons />} />
            <Route path="/salons/:id" element={<SalonDetails />} />

            {/* Customer */}
            <Route path="/book" element={<ProtectedRoute roles={['customer']}><Booking /></ProtectedRoute>} />
            <Route path="/payment/:bookingId" element={<ProtectedRoute roles={['customer']}><Payment /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute roles={['customer']}><BookingHistory /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute roles={['customer']}><Favorites /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute roles={['customer']}><Notifications /></ProtectedRoute>} />
            <Route path="/ai-hairstyle" element={<ProtectedRoute roles={['customer']}><AIHairstyle /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute roles={['customer', 'owner', 'admin']}><Profile /></ProtectedRoute>} />

            {/* Owner */}
            <Route path="/owner/dashboard" element={<ProtectedRoute roles={['owner']}><OwnerDashboard /></ProtectedRoute>} />
            <Route path="/owner/salon" element={<ProtectedRoute roles={['owner']}><SalonManagement /></ProtectedRoute>} />
            <Route path="/owner/salon-setup" element={<ProtectedRoute roles={['owner']}><SalonSetup /></ProtectedRoute>} />
            <Route path="/owner/barbers" element={<ProtectedRoute roles={['owner']}><BarberManagement /></ProtectedRoute>} />
            <Route path="/owner/services" element={<ProtectedRoute roles={['owner']}><ServiceManagement /></ProtectedRoute>} />
            <Route path="/owner/slots" element={<ProtectedRoute roles={['owner']}><SlotManagement /></ProtectedRoute>} />
            <Route path="/owner/bookings" element={<ProtectedRoute roles={['owner']}><OwnerBookings /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/salons" element={<ProtectedRoute roles={['admin']}><AdminSalons /></ProtectedRoute>} />
            <Route path="/admin/reviews" element={<ProtectedRoute roles={['admin']}><AdminReviews /></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute roles={['admin']}><AdminPayments /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute roles={['admin']}><AdminSettings /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Home />} />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

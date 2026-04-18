import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/Home/HomePage';
import DirectoryPage from './pages/Directory/DirectoryPage';
import TherapistProfilePage from './pages/TherapistProfile/TherapistProfilePage';
import BookingPage from './pages/Booking/BookingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import PatientDashboard from './pages/Dashboards/PatientDashboard';
import TherapistDashboard from './pages/Dashboards/TherapistDashboard';
import InboxPage from './pages/Inbox/InboxPage';
import ReservationsPage from './pages/Reservations/ReservationsPage';
import VideoCallPage from './pages/VideoCall/VideoCallPage';
import TherapistSettings from './pages/Dashboards/TherapistSettings';
import PatientSettings from './pages/Dashboards/PatientSettings';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ReservationProvider } from './context/ReservationContext';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  if (!user) {
    return <Navigate to="/connexion" replace />;
  }
  
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'therapist' ? '/therapeute/dashboard' : '/patient/dashboard'} replace />;
  }
  
  return children;
}

function ConditionalNavbar() {
  const location = useLocation();
  const authRoutes = ['/connexion', '/inscription'];
  if (authRoutes.includes(location.pathname)) return null;
  return <Navbar />;
}

function ConditionalFooter() {
  const location = useLocation();
  const hiddenRoutes = ['/messagerie', '/reservations', '/connexion', '/inscription'];
  if (hiddenRoutes.includes(location.pathname)) return null;
  return <Footer />;
}

export default function App() {
  return (
    <AuthProvider>
      <ReservationProvider>
        <BrowserRouter>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <ConditionalNavbar />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/therapeutes" element={<DirectoryPage />} />
                <Route path="/therapeutes/:id" element={<TherapistProfilePage />} />
                <Route path="/reserver/:id" element={<BookingPage />} />
                <Route path="/connexion" element={<LoginPage />} />
                <Route path="/inscription" element={<RegisterPage />} />
                
                <Route path="/patient/dashboard" element={
                  <ProtectedRoute role="patient">
                    <PatientDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/therapeute/dashboard" element={
                  <ProtectedRoute role="therapist">
                    <TherapistDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/therapeute/parametres" element={
                  <ProtectedRoute role="therapist">
                    <TherapistSettings />
                  </ProtectedRoute>
                } />
                <Route path="/parametres" element={
                  <ProtectedRoute role="patient">
                    <PatientSettings />
                  </ProtectedRoute>
                } />
                <Route path="/messagerie" element={
                  <ProtectedRoute>
                    <InboxPage />
                  </ProtectedRoute>
                } />
                <Route path="/reservations" element={
                  <ProtectedRoute>
                    <ReservationsPage />
                  </ProtectedRoute>
                } />
                <Route path="/appel" element={
                  <ProtectedRoute>
                    <VideoCallPage />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <ConditionalFooter />
            <Toaster
              position="top-center"
              richColors
              closeButton
              toastOptions={{
                style: {
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  borderRadius: '12px',
                },
              }}
            />
          </div>
        </BrowserRouter>
      </ReservationProvider>
    </AuthProvider>
  );
}

import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import LandingPage from './pages/LandingPage';
import OrderWizard from './pages/OrderWizard';
import OrderTracking from './pages/OrderTracking';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/siparis/*" element={<OrderWizard />} />
        <Route path="/takip" element={<OrderTracking />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}

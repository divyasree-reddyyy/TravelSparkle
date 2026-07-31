import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import LandingPage from '@/pages/LandingPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import DestinationsPage from '@/pages/DestinationsPage';
import DestinationDetailPage from '@/pages/DestinationDetailPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import TripsListPage from '@/pages/TripsListPage';
import TripFormPage from '@/pages/TripFormPage';
import ItineraryPage from '@/pages/ItineraryPage';
import FavoritesPage from '@/pages/FavoritesPage';
import BudgetPlannerPage from '@/pages/BudgetPlannerPage';
import AdminPage from '@/pages/AdminPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/destinations/:id" element={<DestinationDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/trips" element={<TripsListPage />} />
            <Route path="/dashboard/trips/new" element={<TripFormPage />} />
            <Route path="/dashboard/trips/:id/edit" element={<TripFormPage />} />
            <Route path="/dashboard/trips/:tripId/itinerary" element={<ItineraryPage />} />
            <Route path="/dashboard/favorites" element={<FavoritesPage />} />
            <Route path="/dashboard/budget" element={<BudgetPlannerPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

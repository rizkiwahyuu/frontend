import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { loadApiStore } from './services/api';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import MapMonitoringPage from './pages/map/MapMonitoringPage';
import AssetListPage from './pages/assets/AssetListPage';
import AssetDetailPage from './pages/assets/AssetDetailPage';
import DisturbanceListPage from './pages/disturbances/DisturbanceListPage';
import DisturbanceDetailPage from './pages/disturbances/DisturbanceDetailPage';
import FieldReportPage from './pages/reports/FieldReportPage';
import PruningTaskPage from './pages/pruning/PruningTaskPage';
import TemporalAnalysisPage from './pages/analytics/TemporalAnalysisPage';
import RiskPriorityPage from './pages/analytics/RiskPriorityPage';
import UserManagementPage from './pages/users/UserManagementPage';
import ExportReportPage from './pages/export/ExportReportPage';
import SettingsPage from './pages/settings/SettingsPage';

function ProtectedRoute({ children, adminOnly = false }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const user = useAuthStore((s) => s.user);
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const [boot, setBoot] = useState({ loading: true, error: '' });

  useEffect(() => {
    let mounted = true;
    loadApiStore()
      .then(() => {
        restoreSession();
        if (mounted) setBoot({ loading: false, error: '' });
      })
      .catch((error) => {
        if (mounted) setBoot({ loading: false, error: error.message || 'Gagal terhubung ke backend.' });
      });

    return () => {
      mounted = false;
    };
  }, [restoreSession]);

  if (boot.loading) {
    return <div className="min-h-screen grid place-items-center bg-slate-50 text-sm font-semibold text-slate-600">Memuat data backend...</div>;
  }

  if (boot.error) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 px-6">
        <div className="max-w-md rounded-card border border-red-200 bg-white p-6 text-center shadow-soft">
          <h1 className="text-lg font-bold text-slate-900">Backend belum bisa diakses</h1>
          <p className="mt-2 text-sm text-slate-600">{boot.error}</p>
          <p className="mt-4 text-xs text-slate-500">Jalankan Laravel di URL VITE_API_URL lalu refresh halaman.</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="map" element={<MapMonitoringPage />} />
        <Route path="assets" element={<AssetListPage />} />
        <Route path="assets/:id" element={<AssetDetailPage />} />
        <Route path="disturbances" element={<DisturbanceListPage />} />
        <Route path="disturbances/:id" element={<DisturbanceDetailPage />} />
        <Route path="pruning" element={<PruningTaskPage />} />
        <Route path="reports" element={<FieldReportPage />} />
        <Route
          path="analytics"
          element={
            <ProtectedRoute adminOnly>
              <TemporalAnalysisPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="risk"
          element={
            <ProtectedRoute adminOnly>
              <RiskPriorityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute adminOnly>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="export"
          element={
            <ProtectedRoute adminOnly>
              <ExportReportPage />
            </ProtectedRoute>
          }
        />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

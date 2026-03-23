/**
 * AdminPage — Route /admin
 * Shows login screen if not authenticated, otherwise shows the admin dashboard.
 */
import React from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import AdminLogin from '../components/admin/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';

const AdminPage: React.FC = () => {
  const { isLoggedIn } = useAdminAuth();
  return isLoggedIn ? <AdminDashboard /> : <AdminLogin />;
};

export default AdminPage;

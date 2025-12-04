import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from './dashboard/AdminDashboard';
import RWDashboard from './dashboard/RWDashboard';
import RTDashboard from './dashboard/RTDashboard';
import PendudukDashboard from './dashboard/PendudukDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'rw':
      return <RWDashboard />;
    case 'rt':
      return <RTDashboard />;
    case 'penduduk':
      return <PendudukDashboard />;
    default:
      return <div>Role tidak dikenali</div>;
  }
};

export default Dashboard;

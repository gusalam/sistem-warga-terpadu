import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from './dashboard/AdminDashboard';
import RWDashboard from './dashboard/RWDashboard';
import RTDashboard from './dashboard/RTDashboard';
import PendudukDashboard from './dashboard/PendudukDashboard';
import { Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  switch (role) {
    case 'admin':
      return <AdminDashboard />;
    case 'rw':
      return <RWDashboard />;
    case 'rt':
      return <RTDashboard />;
    case 'penduduk':
      return <PendudukDashboard />;
    default:
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-2">Role tidak dikenali atau belum ditetapkan.</p>
          <p className="text-sm text-muted-foreground">Hubungi administrator untuk menetapkan role Anda.</p>
        </div>
      );
  }
};

export default Dashboard;

import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  MessageSquare,
  Megaphone,
  LogOut,
  UserCircle,
  Home,
  Settings,
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
        isActive
          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </NavLink>
  );
};

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { profile, role, logout } = useAuth();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return [
          { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
          { to: '/rw', icon: <Building2 size={20} />, label: 'Kelola RW' },
          { to: '/rt', icon: <Home size={20} />, label: 'Kelola RT' },
        ];
      case 'rw':
        return [
          { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
          { to: '/rt', icon: <Home size={20} />, label: 'Kelola RT' },
          { to: '/penduduk', icon: <Users size={20} />, label: 'Data Penduduk' },
          { to: '/surat', icon: <FileText size={20} />, label: 'Surat' },
          { to: '/laporan', icon: <MessageSquare size={20} />, label: 'Laporan' },
          { to: '/pengumuman', icon: <Megaphone size={20} />, label: 'Pengumuman' },
        ];
      case 'rt':
        return [
          { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
          { to: '/penduduk', icon: <Users size={20} />, label: 'Data Penduduk' },
          { to: '/surat', icon: <FileText size={20} />, label: 'Surat' },
          { to: '/laporan', icon: <MessageSquare size={20} />, label: 'Laporan' },
          { to: '/pengumuman', icon: <Megaphone size={20} />, label: 'Pengumuman' },
        ];
      case 'penduduk':
        return [
          { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
          { to: '/surat', icon: <FileText size={20} />, label: 'Pengajuan Surat' },
          { to: '/laporan', icon: <MessageSquare size={20} />, label: 'Laporan' },
          { to: '/pengumuman', icon: <Megaphone size={20} />, label: 'Pengumuman' },
          { to: '/profil', icon: <UserCircle size={20} />, label: 'Profil' },
        ];
      default:
        return [
          { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        ];
    }
  };

  const getRoleLabel = () => {
    const labels: Record<string, string> = {
      admin: 'Administrator',
      rw: 'Ketua RW',
      rt: 'Ketua RT',
      penduduk: 'Penduduk',
    };
    return role ? labels[role] || 'User' : 'User';
  };

  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutDialogOpen(false);
    logout();
  };

  return (
    <>
      <aside className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <Building2 className="text-sidebar-primary-foreground" size={24} />
            </div>
            <div>
              <h1 className="text-sidebar-foreground font-bold text-lg">Sistem RT/RW</h1>
              <p className="text-sidebar-foreground/60 text-xs">Manajemen Wilayah</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <UserCircle className="text-sidebar-foreground/70" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sidebar-foreground font-medium text-sm truncate">{profile?.nama || 'User'}</p>
              <p className="text-sidebar-foreground/60 text-xs">{getRoleLabel()}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {getNavItems().map((item) => (
            <NavItem key={item.to} {...item} onClick={onNavigate} />
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        title="Keluar dari Sistem"
        description="Apakah Anda yakin ingin keluar dari sistem? Anda harus login kembali untuk mengakses dashboard."
        confirmText="Keluar"
        variant="warning"
        onConfirm={confirmLogout}
      />
    </>
  );
};

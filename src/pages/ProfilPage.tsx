import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { useAuth } from '@/contexts/AuthContext';
import { useMyPendudukData, useRTList, useRWList } from '@/hooks/useSupabaseData';
import { UserCircle, Mail, Phone, MapPin, Calendar, CreditCard, Home, Building2, Loader2 } from 'lucide-react';

const ProfilPage: React.FC = () => {
  const { user, profile, role } = useAuth();
  
  const { data: penduduk, isLoading: loadingPenduduk } = useMyPendudukData();
  const { data: rtList = [] } = useRTList();
  const { data: rwList = [] } = useRWList();
  
  const rt = rtList.find(r => r.id === profile?.rt_id);
  const rw = rwList.find(r => r.id === profile?.rw_id) || (rt?.rw as any);

  const getRoleLabel = () => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'rw': return 'Ketua RW';
      case 'rt': return 'Ketua RT';
      case 'penduduk': return 'Penduduk';
      default: return 'User';
    }
  };

  const profileData = [
    { icon: CreditCard, label: 'NIK', value: penduduk?.nik || profile?.nik || '-' },
    { icon: Mail, label: 'Email', value: user?.email || profile?.email || '-' },
    { icon: Phone, label: 'No. HP', value: penduduk?.phone || profile?.phone || '-' },
    { icon: Calendar, label: 'Tanggal Lahir', value: penduduk?.tanggal_lahir || '-' },
    { icon: MapPin, label: 'Alamat', value: penduduk?.alamat || profile?.alamat || '-' },
    { icon: Home, label: 'RT', value: rt?.nama || penduduk?.rt?.nama || '-' },
    { icon: Building2, label: 'RW', value: rw?.nama || penduduk?.rt?.rw?.nama || '-' },
  ];

  if (loadingPenduduk) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <PageHeader
        title="Profil Saya"
        description="Informasi data diri Anda"
      />

      <div className="max-w-2xl">
        {/* Profile Card */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="gradient-primary p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-primary-foreground/20 mx-auto flex items-center justify-center mb-4">
              <UserCircle className="text-primary-foreground" size={64} />
            </div>
            <h2 className="text-2xl font-bold text-primary-foreground">{profile?.nama || 'User'}</h2>
            <p className="text-primary-foreground/80 mt-1">{getRoleLabel()}</p>
          </div>

          {/* Profile Info */}
          <div className="p-6 space-y-4">
            {profileData.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <item.icon size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-accent rounded-lg">
          <p className="text-sm text-accent-foreground">
            Jika ada data yang tidak sesuai, silakan hubungi RT setempat untuk melakukan perubahan data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilPage;

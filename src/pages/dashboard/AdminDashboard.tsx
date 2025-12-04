import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable, Column } from '@/components/ui/data-table';
import { useRWList, useRTList, useDashboardStats } from '@/hooks/useSupabaseData';
import { RW } from '@/lib/types';
import { Building2, Home, Users, Activity, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { data: rwList = [], isLoading: loadingRW } = useRWList();
  const { data: rtList = [], isLoading: loadingRT } = useRTList();
  const { data: stats, isLoading: loadingStats } = useDashboardStats();

  const rwColumns: Column<RW>[] = [
    { key: 'nama', header: 'Nama RW' },
    { key: 'nomor', header: 'Nomor' },
    { key: 'alamat', header: 'Alamat', render: (rw) => rw.alamat || '-' },
  ];

  const isLoading = loadingRW || loadingRT || loadingStats;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <PageHeader
        title="Dashboard Administrator"
        description="Ringkasan data RT/RW seluruh wilayah"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total RW"
          value={stats?.totalRW || rwList.length}
          icon={Building2}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="Total RT"
          value={stats?.totalRT || rtList.length}
          icon={Home}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="Total Penduduk"
          value={(stats?.totalPenduduk || 0).toLocaleString()}
          icon={Users}
          iconClassName="bg-warning/10 text-warning"
        />
        <StatCard
          title="Status Sistem"
          value="Aktif"
          icon={Activity}
          description="Semua layanan berjalan normal"
          iconClassName="bg-success/10 text-success"
        />
      </div>

      {/* RW Table */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Daftar RW</h2>
        {rwList.length > 0 ? (
          <DataTable columns={rwColumns} data={rwList} />
        ) : (
          <div className="bg-card rounded-xl p-8 border border-border text-center text-muted-foreground">
            <Building2 className="mx-auto mb-2" size={32} />
            <p>Belum ada data RW</p>
          </div>
        )}
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="font-semibold mb-4">Aksi Cepat</h3>
          <div className="space-y-3">
            <Link to="/rw" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Building2 size={20} />
              </div>
              <div>
                <p className="font-medium">Kelola RW</p>
                <p className="text-sm text-muted-foreground">Tambah, edit, atau hapus data RW</p>
              </div>
            </Link>
            <Link to="/rt" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
              <div className="p-2 rounded-lg bg-success/10 text-success">
                <Home size={20} />
              </div>
              <div>
                <p className="font-medium">Kelola RT</p>
                <p className="text-sm text-muted-foreground">Tambah, edit, atau hapus data RT</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="font-semibold mb-4">Statistik Wilayah</h3>
          <div className="space-y-4">
            {rwList.length > 0 ? (
              rwList.map((rw) => {
                const rtCount = rtList.filter(rt => rt.rw_id === rw.id).length;
                return (
                  <div key={rw.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{rw.nama}</p>
                      <p className="text-sm text-muted-foreground">{rw.alamat || 'Alamat belum diisi'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{rtCount}</p>
                      <p className="text-xs text-muted-foreground">RT</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground text-center py-4">Belum ada data RW</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
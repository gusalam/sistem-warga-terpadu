import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { useRTList, useSuratList, useLaporanList, usePendudukList } from '@/hooks/useSupabaseData';
import { JENIS_SURAT_OPTIONS, SURAT_STATUS_LABELS, RT } from '@/lib/types';
import { Home, Users, FileText, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const RWDashboard: React.FC = () => {
  const { profile } = useAuth();
  
  // Get data - filtered by RLS for RW
  const { data: rtList = [], isLoading: loadingRT } = useRTList(profile?.rw_id || undefined);
  const { data: suratList = [], isLoading: loadingSurat } = useSuratList();
  const { data: laporanList = [], isLoading: loadingLaporan } = useLaporanList();
  const { data: pendudukList = [], isLoading: loadingPenduduk } = usePendudukList();
  
  const totalPenduduk = pendudukList.length;
  const pendingSurat = suratList.filter(s => s.status === 'pending' || s.status === 'diproses');
  const activeLaporan = laporanList.filter(l => l.status !== 'selesai' && l.status !== 'ditolak');

  const getJenisSuratLabel = (jenis: string) => {
    return JENIS_SURAT_OPTIONS.find(o => o.value === jenis)?.label || jenis;
  };

  const rtColumns: Column<RT>[] = [
    { key: 'nama', header: 'Nama RT' },
    { key: 'nomor', header: 'Nomor RT' },
    { 
      key: 'alamat', 
      header: 'Alamat',
      render: (rt) => rt.alamat || '-'
    },
  ];

  const isLoading = loadingRT || loadingSurat || loadingLaporan || loadingPenduduk;

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
        title="Dashboard RW"
        description={`Selamat datang, ${profile?.nama || 'Ketua RW'}`}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Jumlah RT"
          value={rtList.length}
          icon={Home}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="Total Penduduk"
          value={totalPenduduk}
          icon={Users}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="Surat Pending"
          value={pendingSurat.length}
          icon={FileText}
          iconClassName="bg-warning/10 text-warning"
        />
        <StatCard
          title="Laporan Aktif"
          value={activeLaporan.length}
          icon={MessageSquare}
          iconClassName="bg-destructive/10 text-destructive"
        />
      </div>

      {/* RT List */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Daftar RT di Wilayah Anda</h2>
        {rtList.length > 0 ? (
          <DataTable columns={rtColumns} data={rtList} />
        ) : (
          <div className="bg-card rounded-xl p-8 border border-border text-center text-muted-foreground">
            <Home className="mx-auto mb-2" size={32} />
            <p>Belum ada data RT</p>
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Surat */}
        <div className="bg-card rounded-xl p-4 sm:p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm sm:text-base">Surat Terbaru</h3>
            <Link to="/surat" className="text-sm text-primary hover:underline">Lihat semua</Link>
          </div>
          {pendingSurat.length > 0 ? (
            <div className="space-y-3">
              {pendingSurat.slice(0, 5).map((surat) => {
                const variants: Record<string, 'warning' | 'info' | 'success' | 'error'> = {
                  pending: 'warning',
                  diproses: 'info',
                  selesai: 'success',
                  ditolak: 'error',
                };
                return (
                  <div key={surat.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{(surat.penduduk as any)?.nama || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{getJenisSuratLabel(surat.jenis_surat)}</p>
                    </div>
                    <StatusBadge 
                      status={SURAT_STATUS_LABELS[surat.status]} 
                      variant={variants[surat.status]} 
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto mb-2" size={32} />
              <p>Tidak ada surat pending</p>
            </div>
          )}
        </div>

        {/* Recent Laporan */}
        <div className="bg-card rounded-xl p-4 sm:p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm sm:text-base">Laporan Terbaru</h3>
            <Link to="/laporan" className="text-sm text-primary hover:underline">Lihat semua</Link>
          </div>
          {activeLaporan.length > 0 ? (
            <div className="space-y-3">
              {activeLaporan.slice(0, 5).map((laporan) => (
                <div key={laporan.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{laporan.judul}</p>
                    <p className="text-sm text-muted-foreground">{(laporan.penduduk as any)?.nama || 'Unknown'}</p>
                  </div>
                  <StatusBadge 
                    status={laporan.status === 'pending' ? 'Baru' : 'Diproses'} 
                    variant={laporan.status === 'pending' ? 'warning' : 'info'} 
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="mx-auto mb-2" size={32} />
              <p>Tidak ada laporan aktif</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RWDashboard;

import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { usePendudukList, useSuratList, useLaporanList } from '@/hooks/useSupabaseData';
import { JENIS_SURAT_OPTIONS, SURAT_STATUS_LABELS, LAPORAN_STATUS_LABELS } from '@/lib/types';
import { Users, FileText, MessageSquare, UserCheck, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const RTDashboard: React.FC = () => {
  const { profile } = useAuth();
  
  // Get data for current RT - will be filtered by RLS
  const { data: myPenduduk = [], isLoading: loadingPenduduk } = usePendudukList(profile?.rt_id || undefined);
  const { data: suratList = [], isLoading: loadingSurat } = useSuratList(profile?.rt_id || undefined);
  const { data: laporanList = [], isLoading: loadingLaporan } = useLaporanList(profile?.rt_id || undefined);
  
  const pendudukDenganAkun = myPenduduk.filter(p => p.user_id);
  const pendingSurat = suratList.filter(s => s.status === 'pending');
  const activeLaporan = laporanList.filter(l => l.status !== 'selesai' && l.status !== 'ditolak');

  const getJenisSuratLabel = (jenis: string) => {
    return JENIS_SURAT_OPTIONS.find(o => o.value === jenis)?.label || jenis;
  };

  const isLoading = loadingPenduduk || loadingSurat || loadingLaporan;

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
        title="Dashboard RT"
        description={`Selamat datang, ${profile?.nama || 'Ketua RT'}`}
        actions={
          <Link to="/rt/penduduk">
            <Button>
              <Plus size={18} />
              Tambah Penduduk
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Penduduk"
          value={myPenduduk.length}
          icon={Users}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="Punya Akun"
          value={pendudukDenganAkun.length}
          icon={UserCheck}
          description={myPenduduk.length > 0 ? `${((pendudukDenganAkun.length / myPenduduk.length) * 100).toFixed(0)}% dari total` : '0%'}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="Surat Menunggu"
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Link to="/rt/penduduk" className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-semibold">Kelola Penduduk</h3>
              <p className="text-sm text-muted-foreground">Lihat dan kelola data penduduk</p>
            </div>
          </div>
        </Link>
        <Link to="/rt/surat" className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-warning/10 text-warning group-hover:bg-warning group-hover:text-warning-foreground transition-colors">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-semibold">Proses Surat</h3>
              <p className="text-sm text-muted-foreground">{pendingSurat.length} surat menunggu diproses</p>
            </div>
          </div>
        </Link>
        <Link to="/rt/laporan" className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground transition-colors">
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="font-semibold">Tindak Laporan</h3>
              <p className="text-sm text-muted-foreground">{activeLaporan.length} laporan perlu ditindak</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Surat */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Surat Menunggu Persetujuan</h3>
            <Link to="/rt/surat" className="text-sm text-primary hover:underline">Lihat semua</Link>
          </div>
          {pendingSurat.length > 0 ? (
            <div className="space-y-3">
              {pendingSurat.slice(0, 5).map((surat) => (
                <div key={surat.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{(surat.penduduk as any)?.nama || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{getJenisSuratLabel(surat.jenis_surat)}</p>
                  </div>
                  <StatusBadge status={SURAT_STATUS_LABELS[surat.status]} variant="warning" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto mb-2" size={32} />
              <p>Tidak ada surat menunggu</p>
            </div>
          )}
        </div>

        {/* Active Laporan */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Laporan Perlu Ditindak</h3>
            <Link to="/rt/laporan" className="text-sm text-primary hover:underline">Lihat semua</Link>
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
                    status={LAPORAN_STATUS_LABELS[laporan.status]} 
                    variant={laporan.status === 'pending' ? 'warning' : 'info'} 
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="mx-auto mb-2" size={32} />
              <p>Tidak ada laporan aktif</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RTDashboard;

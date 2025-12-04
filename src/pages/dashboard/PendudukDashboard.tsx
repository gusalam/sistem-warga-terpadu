import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { useMySuratList, useMyLaporanList, usePengumumanList } from '@/hooks/useSupabaseData';
import { JENIS_SURAT_OPTIONS, SURAT_STATUS_LABELS } from '@/lib/types';
import { FileText, MessageSquare, Megaphone, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const PendudukDashboard: React.FC = () => {
  const { profile } = useAuth();
  
  const { data: mySurat = [], isLoading: loadingSurat } = useMySuratList();
  const { data: myLaporan = [], isLoading: loadingLaporan } = useMyLaporanList();
  const { data: pengumumanList = [], isLoading: loadingPengumuman } = usePengumumanList();
  
  const pengumumanTerbaru = pengumumanList.slice(0, 3);
  
  const suratSelesai = mySurat.filter(s => s.status === 'selesai').length;
  const laporanSelesai = myLaporan.filter(l => l.status === 'selesai').length;

  const getJenisSuratLabel = (jenis: string) => {
    return JENIS_SURAT_OPTIONS.find(o => o.value === jenis)?.label || jenis;
  };

  const isLoading = loadingSurat || loadingLaporan || loadingPengumuman;

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
        title={`Selamat Datang, ${profile?.nama || 'User'}`}
        description="Kelola pengajuan surat dan laporan Anda"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Surat"
          value={mySurat.length}
          icon={FileText}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="Surat Selesai"
          value={suratSelesai}
          icon={CheckCircle}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="Total Laporan"
          value={myLaporan.length}
          icon={MessageSquare}
          iconClassName="bg-warning/10 text-warning"
        />
        <StatCard
          title="Laporan Selesai"
          value={laporanSelesai}
          icon={CheckCircle}
          iconClassName="bg-success/10 text-success"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-semibold">Ajukan Surat</h3>
              <p className="text-sm text-muted-foreground">Buat pengajuan surat baru</p>
            </div>
          </div>
          <Link to="/surat">
            <Button className="w-full">Ajukan Surat Baru</Button>
          </Link>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-warning/10 text-warning">
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="font-semibold">Buat Laporan</h3>
              <p className="text-sm text-muted-foreground">Laporkan masalah atau aduan</p>
            </div>
          </div>
          <Link to="/laporan">
            <Button variant="outline" className="w-full">Buat Laporan Baru</Button>
          </Link>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Surat */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Pengajuan Surat Saya</h3>
            <Link to="/surat" className="text-sm text-primary hover:underline">Lihat semua</Link>
          </div>
          {mySurat.length > 0 ? (
            <div className="space-y-3">
              {mySurat.slice(0, 5).map((surat) => {
                const variants: Record<string, 'warning' | 'info' | 'success' | 'error'> = {
                  pending: 'warning',
                  diproses: 'info',
                  selesai: 'success',
                  ditolak: 'error',
                };
                return (
                  <div key={surat.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{getJenisSuratLabel(surat.jenis_surat)}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(surat.created_at), 'dd MMM yyyy')}
                      </p>
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
              <p>Belum ada pengajuan surat</p>
            </div>
          )}
        </div>

        {/* Pengumuman */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Pengumuman Terbaru</h3>
            <Link to="/pengumuman" className="text-sm text-primary hover:underline">Lihat semua</Link>
          </div>
          {pengumumanTerbaru.length > 0 ? (
            <div className="space-y-3">
              {pengumumanTerbaru.map((pengumuman) => (
                <div key={pengumuman.id} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Megaphone size={14} className="text-primary" />
                    <p className="font-medium text-sm">{pengumuman.judul}</p>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{pengumuman.isi}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(pengumuman.published_at), 'dd MMM yyyy')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Megaphone className="mx-auto mb-2" size={32} />
              <p>Tidak ada pengumuman</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendudukDashboard;

import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable, Column } from '@/components/ui/data-table';
import { dummyRW, dummyRT, RW, RT } from '@/lib/dummy-data';
import { Building2, Home, Users, Activity } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const totalPenduduk = dummyRW.reduce((acc, rw) => acc + rw.jumlah_penduduk, 0);

  const rwColumns: Column<RW>[] = [
    { key: 'nama_rw', header: 'Nama RW' },
    { key: 'ketua', header: 'Ketua' },
    { key: 'jumlah_rt', header: 'Jumlah RT', className: 'text-center' },
    { key: 'jumlah_penduduk', header: 'Jumlah Penduduk', className: 'text-center' },
  ];

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
          value={dummyRW.length}
          icon={Building2}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="Total RT"
          value={dummyRT.length}
          icon={Home}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="Total Penduduk"
          value={totalPenduduk.toLocaleString()}
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
        <DataTable columns={rwColumns} data={dummyRW} />
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="font-semibold mb-4">Aksi Cepat</h3>
          <div className="space-y-3">
            <a href="/rw" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Building2 size={20} />
              </div>
              <div>
                <p className="font-medium">Kelola RW</p>
                <p className="text-sm text-muted-foreground">Tambah, edit, atau hapus data RW</p>
              </div>
            </a>
            <a href="/rt" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
              <div className="p-2 rounded-lg bg-success/10 text-success">
                <Home size={20} />
              </div>
              <div>
                <p className="font-medium">Kelola RT</p>
                <p className="text-sm text-muted-foreground">Tambah, edit, atau hapus data RT</p>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="font-semibold mb-4">Statistik Wilayah</h3>
          <div className="space-y-4">
            {dummyRW.map((rw) => (
              <div key={rw.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{rw.nama_rw}</p>
                  <p className="text-sm text-muted-foreground">{rw.ketua}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">{rw.jumlah_penduduk}</p>
                  <p className="text-xs text-muted-foreground">penduduk</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

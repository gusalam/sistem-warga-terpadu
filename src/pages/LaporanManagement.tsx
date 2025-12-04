import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLaporanList, useCreateLaporan, useUpdateLaporanStatus, LaporanWithPenduduk } from '@/hooks/useLaporanData';
import { usePendudukList } from '@/hooks/usePendudukData';
import { useAuth } from '@/contexts/AuthContext';
import { LaporanStatus, LAPORAN_STATUS_LABELS, KATEGORI_LAPORAN_OPTIONS } from '@/lib/types';
import { Plus, Search, Eye, CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

const LaporanManagement: React.FC = () => {
  const { user, role, profile } = useAuth();
  const isPenduduk = role === 'penduduk';
  const isRT = role === 'rt';
  
  const [pendudukData, setPendudukData] = useState<{ id: string; rt_id: string } | null>(null);

  // For penduduk, find their penduduk_id
  useEffect(() => {
    const fetchPendudukId = async () => {
      if (isPenduduk && user?.id) {
        const { data } = await supabase
          .from('penduduk')
          .select('id, rt_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data) {
          setPendudukData(data);
        }
      }
    };
    fetchPendudukId();
  }, [isPenduduk, user?.id]);

  const rtIdFilter = isRT ? profile?.rt_id || undefined : undefined;
  const { data: laporanList = [], isLoading } = useLaporanList(rtIdFilter, isPenduduk ? pendudukData?.id : undefined);
  const { data: pendudukList = [] } = usePendudukList(rtIdFilter);
  const createLaporan = useCreateLaporan();
  const updateStatus = useUpdateLaporanStatus();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [kategoriFilter, setKategoriFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState<LaporanWithPenduduk | null>(null);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    kategori: 'lainnya',
  });
  const [tanggapan, setTanggapan] = useState('');

  const filteredLaporan = laporanList.filter((l) => {
    const matchesSearch = 
      l.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.penduduk_nama || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchesKategori = kategoriFilter === 'all' || l.kategori === kategoriFilter;
    return matchesSearch && matchesStatus && matchesKategori;
  });

  const handleAdd = () => {
    setFormData({ judul: '', deskripsi: '', kategori: 'lainnya' });
    setIsDialogOpen(true);
  };

  const handleViewDetail = (laporan: LaporanWithPenduduk) => {
    setSelectedLaporan(laporan);
    setTanggapan('');
    setIsDetailOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendudukData) return;

    createLaporan.mutate({
      judul: formData.judul,
      deskripsi: formData.deskripsi,
      kategori: formData.kategori,
      penduduk_id: pendudukData.id,
      rt_id: pendudukData.rt_id,
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
      },
    });
  };

  const handleProcess = () => {
    if (selectedLaporan && user) {
      updateStatus.mutate({
        id: selectedLaporan.id,
        status: 'diproses',
        processed_by: user.id,
      }, {
        onSuccess: () => setIsDetailOpen(false),
      });
    }
  };

  const handleComplete = () => {
    if (selectedLaporan && user) {
      updateStatus.mutate({
        id: selectedLaporan.id,
        status: 'selesai',
        tanggapan: tanggapan || undefined,
        processed_by: user.id,
      }, {
        onSuccess: () => setIsDetailOpen(false),
      });
    }
  };

  const getStatusVariant = (status: LaporanStatus): 'warning' | 'info' | 'success' | 'error' => {
    const variants: Record<LaporanStatus, 'warning' | 'info' | 'success' | 'error'> = {
      pending: 'warning',
      diproses: 'info',
      ditindaklanjuti: 'info',
      selesai: 'success',
      ditolak: 'error',
    };
    return variants[status];
  };

  const getKategoriLabel = (kategori: string) => {
    return KATEGORI_LAPORAN_OPTIONS.find(o => o.value === kategori)?.label || kategori;
  };

  const columns: Column<LaporanWithPenduduk>[] = [
    { key: 'judul', header: 'Judul' },
    ...(isPenduduk ? [] : [{ key: 'penduduk_nama' as keyof LaporanWithPenduduk, header: 'Pelapor' }]),
    {
      key: 'kategori',
      header: 'Kategori',
      render: (l: LaporanWithPenduduk) => (
        <StatusBadge status={getKategoriLabel(l.kategori || '')} variant="default" />
      ),
    },
    { 
      key: 'created_at', 
      header: 'Tanggal',
      render: (l: LaporanWithPenduduk) => format(new Date(l.created_at), 'dd/MM/yyyy')
    },
    {
      key: 'status',
      header: 'Status',
      render: (l: LaporanWithPenduduk) => (
        <StatusBadge status={LAPORAN_STATUS_LABELS[l.status]} variant={getStatusVariant(l.status)} />
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'text-right',
      render: (l: LaporanWithPenduduk) => (
        <Button size="sm" variant="ghost" onClick={() => handleViewDetail(l)}>
          <Eye size={14} />
          Detail
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <PageHeader
        title={isPenduduk ? 'Laporan Saya' : 'Manajemen Laporan'}
        description={isPenduduk ? 'Buat dan pantau laporan/aduan Anda' : 'Kelola laporan/aduan warga'}
        actions={
          isPenduduk && pendudukData && (
            <Button onClick={handleAdd}>
              <Plus size={18} />
              Buat Laporan
            </Button>
          )
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{laporanList.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border border-l-4 border-l-warning">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-warning">{laporanList.filter(l => l.status === 'pending').length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border border-l-4 border-l-primary">
          <p className="text-sm text-muted-foreground">Diproses</p>
          <p className="text-2xl font-bold text-primary">{laporanList.filter(l => l.status === 'diproses').length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border border-l-4 border-l-success">
          <p className="text-sm text-muted-foreground">Selesai</p>
          <p className="text-2xl font-bold text-success">{laporanList.filter(l => l.status === 'selesai').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Cari judul atau pelapor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {KATEGORI_LAPORAN_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="diproses">Diproses</SelectItem>
            <SelectItem value="selesai">Selesai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredLaporan} emptyMessage="Tidak ada data laporan" />

      {/* Add Laporan Dialog (Penduduk) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Laporan Baru</DialogTitle>
            <DialogDescription>Laporkan masalah atau aduan Anda</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="judul">Judul Laporan</Label>
                <Input
                  id="judul"
                  placeholder="Judul singkat laporan"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kategori">Kategori</Label>
                <Select
                  value={formData.kategori}
                  onValueChange={(value) => setFormData({ ...formData, kategori: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {KATEGORI_LAPORAN_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi Laporan</Label>
                <Textarea
                  id="deskripsi"
                  placeholder="Jelaskan detail laporan Anda..."
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  rows={4}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createLaporan.isPending}>
                {createLaporan.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Kirim Laporan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Laporan</DialogTitle>
            <DialogDescription>Informasi lengkap laporan</DialogDescription>
          </DialogHeader>
          {selectedLaporan && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm text-muted-foreground">Judul</p>
                <p className="font-medium text-lg">{selectedLaporan.judul}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pelapor</p>
                  <p className="font-medium">{selectedLaporan.penduduk_nama}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal</p>
                  <p className="font-medium">{format(new Date(selectedLaporan.created_at), 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kategori</p>
                  <StatusBadge status={getKategoriLabel(selectedLaporan.kategori || '')} variant="default" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge 
                    status={LAPORAN_STATUS_LABELS[selectedLaporan.status]} 
                    variant={getStatusVariant(selectedLaporan.status)} 
                  />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deskripsi Laporan</p>
                <p className="font-medium bg-muted/50 p-3 rounded-lg mt-1">{selectedLaporan.deskripsi}</p>
              </div>
              {selectedLaporan.tanggapan && (
                <div>
                  <p className="text-sm text-muted-foreground">Tanggapan</p>
                  <p className="font-medium bg-success/10 p-3 rounded-lg mt-1">{selectedLaporan.tanggapan}</p>
                </div>
              )}
              
              {/* RT Actions */}
              {isRT && selectedLaporan.status !== 'selesai' && (
                <div className="border-t pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Tanggapan (opsional)</Label>
                    <Textarea
                      placeholder="Masukkan tanggapan..."
                      value={tanggapan}
                      onChange={(e) => setTanggapan(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    {selectedLaporan.status === 'pending' && (
                      <Button onClick={handleProcess} variant="outline" className="flex-1" disabled={updateStatus.isPending}>
                        Proses Laporan
                      </Button>
                    )}
                    <Button onClick={handleComplete} variant="default" className="flex-1 bg-success hover:bg-success/90" disabled={updateStatus.isPending}>
                      <CheckCircle size={16} />
                      Tandai Selesai
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LaporanManagement;

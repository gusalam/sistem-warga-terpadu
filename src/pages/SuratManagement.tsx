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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useSuratList, useCreateSurat, useUpdateSuratStatus, SuratWithPenduduk } from '@/hooks/useSuratData';
import { usePendudukList } from '@/hooks/usePendudukData';
import { useAuth } from '@/contexts/AuthContext';
import { SuratStatus, SURAT_STATUS_LABELS, JENIS_SURAT_OPTIONS } from '@/lib/types';
import { Plus, Search, Check, X, Download, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { downloadSurat } from '@/lib/suratGenerator';
import { toast } from 'sonner';

const SuratManagement: React.FC = () => {
  const { user, role, profile } = useAuth();
  const isPenduduk = role === 'penduduk';
  const isRT = role === 'rt';
  
  const [pendudukId, setPendudukId] = useState<string | undefined>(undefined);

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
          setPendudukId(data.id);
        }
      }
    };
    fetchPendudukId();
  }, [isPenduduk, user?.id]);

  const rtIdFilter = isRT ? profile?.rt_id || undefined : undefined;
  const { data: suratList = [], isLoading } = useSuratList(rtIdFilter, isPenduduk ? pendudukId : undefined);
  const { data: pendudukList = [] } = usePendudukList(rtIdFilter);
  const createSurat = useCreateSurat();
  const updateStatus = useUpdateSuratStatus();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState<SuratWithPenduduk | null>(null);
  const [formData, setFormData] = useState({
    jenis_surat: 'domisili',
    keperluan: '',
  });
  const [rejectReason, setRejectReason] = useState('');

  const filteredSurat = suratList.filter((s) => {
    const matchesSearch = (s.penduduk_nama || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setFormData({ jenis_surat: 'domisili', keperluan: '' });
    setIsDialogOpen(true);
  };

  const handleViewDetail = (surat: SuratWithPenduduk) => {
    setSelectedSurat(surat);
    setRejectReason('');
    setIsDetailOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitDialogOpen(true);
  };

  const confirmSubmit = () => {
    if (!pendudukId) return;

    // Get penduduk's rt_id
    const penduduk = pendudukList.find(p => p.id === pendudukId);
    if (!penduduk) return;

    createSurat.mutate({
      jenis_surat: formData.jenis_surat,
      keperluan: formData.keperluan || undefined,
      penduduk_id: pendudukId,
      rt_id: penduduk.rt_id,
    }, {
      onSuccess: () => {
        setIsSubmitDialogOpen(false);
        setIsDialogOpen(false);
      },
    });
  };

  const handleApprove = () => {
    setIsApproveDialogOpen(true);
  };

  const confirmApprove = () => {
    if (selectedSurat && user) {
      updateStatus.mutate({
        id: selectedSurat.id,
        status: 'selesai',
        processed_by: user.id,
        jenis_surat: selectedSurat.jenis_surat,
      }, {
        onSuccess: () => {
          setIsApproveDialogOpen(false);
          setIsDetailOpen(false);
        },
      });
    }
  };

  const handleReject = () => {
    if (!rejectReason) {
      toast.error('Harap masukkan alasan penolakan');
      return;
    }
    setIsRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (selectedSurat && rejectReason && user) {
      updateStatus.mutate({
        id: selectedSurat.id,
        status: 'ditolak',
        catatan: rejectReason,
        processed_by: user.id,
      }, {
        onSuccess: () => {
          setIsRejectDialogOpen(false);
          setIsDetailOpen(false);
        },
      });
    }
  };

  const handleProcess = () => {
    setIsProcessDialogOpen(true);
  };

  const confirmProcess = () => {
    if (selectedSurat && user) {
      updateStatus.mutate({
        id: selectedSurat.id,
        status: 'diproses',
        processed_by: user.id,
      }, {
        onSuccess: () => {
          setIsProcessDialogOpen(false);
          setIsDetailOpen(false);
        },
      });
    }
  };

  const handleDownload = (surat: SuratWithPenduduk) => {
    downloadSurat({
      id: surat.id,
      nomor_surat: surat.nomor_surat,
      jenis_surat: surat.jenis_surat,
      keperluan: surat.keperluan,
      created_at: surat.created_at,
      processed_at: surat.processed_at,
      penduduk_nama: surat.penduduk_nama || 'Tidak diketahui',
      penduduk_nik: surat.penduduk_nik,
      penduduk_alamat: surat.penduduk_alamat,
      rt_nama: surat.rt_nama,
      rw_nama: surat.rw_nama,
    });
    toast.success('Surat dibuka di tab baru, silakan cetak');
  };

  const getStatusVariant = (status: SuratStatus): 'warning' | 'info' | 'success' | 'error' => {
    const variants: Record<SuratStatus, 'warning' | 'info' | 'success' | 'error'> = {
      pending: 'warning',
      diproses: 'info',
      selesai: 'success',
      ditolak: 'error',
    };
    return variants[status];
  };

  const getJenisSuratLabel = (jenis: string) => {
    return JENIS_SURAT_OPTIONS.find(o => o.value === jenis)?.label || jenis;
  };

  const columns: Column<SuratWithPenduduk>[] = [
    ...(isPenduduk ? [] : [{ key: 'penduduk_nama' as keyof SuratWithPenduduk, header: 'Pemohon' }]),
    {
      key: 'jenis_surat',
      header: 'Jenis Surat',
      render: (s: SuratWithPenduduk) => getJenisSuratLabel(s.jenis_surat),
    },
    { 
      key: 'created_at', 
      header: 'Tanggal',
      render: (s: SuratWithPenduduk) => format(new Date(s.created_at), 'dd/MM/yyyy')
    },
    {
      key: 'status',
      header: 'Status',
      render: (s: SuratWithPenduduk) => (
        <StatusBadge status={SURAT_STATUS_LABELS[s.status]} variant={getStatusVariant(s.status)} />
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'text-right',
      render: (s: SuratWithPenduduk) => (
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleViewDetail(s)}>
            <Eye size={14} />
            Detail
          </Button>
          {s.status === 'selesai' && (
            <Button size="sm" variant="outline" onClick={() => handleDownload(s)}>
              <Download size={14} />
              Unduh
            </Button>
          )}
        </div>
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
        title={isPenduduk ? 'Pengajuan Surat' : 'Manajemen Surat'}
        description={isPenduduk ? 'Ajukan dan pantau status surat Anda' : 'Kelola pengajuan surat warga'}
        actions={
          isPenduduk && pendudukId && (
            <Button onClick={handleAdd}>
              <Plus size={18} />
              Ajukan Surat
            </Button>
          )
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-card rounded-xl p-3 sm:p-4 border border-border">
          <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
          <p className="text-xl sm:text-2xl font-bold">{suratList.length}</p>
        </div>
        <div className="bg-card rounded-xl p-3 sm:p-4 border border-border border-l-4 border-l-warning">
          <p className="text-xs sm:text-sm text-muted-foreground">Menunggu</p>
          <p className="text-xl sm:text-2xl font-bold text-warning">{suratList.filter(s => s.status === 'pending').length}</p>
        </div>
        <div className="bg-card rounded-xl p-3 sm:p-4 border border-border border-l-4 border-l-primary">
          <p className="text-xs sm:text-sm text-muted-foreground">Diproses</p>
          <p className="text-xl sm:text-2xl font-bold text-primary">{suratList.filter(s => s.status === 'diproses').length}</p>
        </div>
        <div className="bg-card rounded-xl p-3 sm:p-4 border border-border border-l-4 border-l-success">
          <p className="text-xs sm:text-sm text-muted-foreground">Selesai</p>
          <p className="text-xl sm:text-2xl font-bold text-success">{suratList.filter(s => s.status === 'selesai').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {!isPenduduk && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Cari pemohon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="diproses">Diproses</SelectItem>
            <SelectItem value="selesai">Selesai</SelectItem>
            <SelectItem value="ditolak">Ditolak</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredSurat} emptyMessage="Tidak ada data surat" />

      {/* Add Surat Dialog (Penduduk) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajukan Surat Baru</DialogTitle>
            <DialogDescription>Pilih jenis surat yang ingin diajukan</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="jenis">Jenis Surat</Label>
                <Select
                  value={formData.jenis_surat}
                  onValueChange={(value) => setFormData({ ...formData, jenis_surat: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis surat" />
                  </SelectTrigger>
                  <SelectContent>
                    {JENIS_SURAT_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="keperluan">Keperluan (Opsional)</Label>
                <Textarea
                  id="keperluan"
                  placeholder="Tambahkan keperluan jika diperlukan..."
                  value={formData.keperluan}
                  onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit">
                Ajukan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Surat</DialogTitle>
            <DialogDescription>Informasi pengajuan surat</DialogDescription>
          </DialogHeader>
          {selectedSurat && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pemohon</p>
                  <p className="font-medium">{selectedSurat.penduduk_nama}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal</p>
                  <p className="font-medium">{format(new Date(selectedSurat.created_at), 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jenis Surat</p>
                  <p className="font-medium">{getJenisSuratLabel(selectedSurat.jenis_surat)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge 
                    status={SURAT_STATUS_LABELS[selectedSurat.status]} 
                    variant={getStatusVariant(selectedSurat.status)} 
                  />
                </div>
              </div>
              {selectedSurat.keperluan && (
                <div>
                  <p className="text-sm text-muted-foreground">Keperluan</p>
                  <p className="font-medium">{selectedSurat.keperluan}</p>
                </div>
              )}
              {selectedSurat.catatan && (
                <div>
                  <p className="text-sm text-muted-foreground">Catatan</p>
                  <p className="font-medium">{selectedSurat.catatan}</p>
                </div>
              )}
              
              {/* RT Actions */}
              {isRT && selectedSurat.status === 'pending' && (
                <div className="border-t pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Alasan Penolakan (jika ditolak)</Label>
                    <Textarea
                      placeholder="Masukkan alasan penolakan..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleProcess} variant="outline" className="flex-1" disabled={updateStatus.isPending}>
                      Proses
                    </Button>
                    <Button onClick={handleApprove} variant="default" className="flex-1 bg-success hover:bg-success/90" disabled={updateStatus.isPending}>
                      <Check size={16} />
                      Setujui
                    </Button>
                    <Button onClick={handleReject} variant="destructive" className="flex-1" disabled={updateStatus.isPending}>
                      <X size={16} />
                      Tolak
                    </Button>
                  </div>
                </div>
              )}
              
              {isRT && selectedSurat.status === 'diproses' && (
                <div className="border-t pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Alasan Penolakan (jika ditolak)</Label>
                    <Textarea
                      placeholder="Masukkan alasan penolakan..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleApprove} variant="default" className="flex-1 bg-success hover:bg-success/90" disabled={updateStatus.isPending}>
                      <Check size={16} />
                      Setujui
                    </Button>
                    <Button onClick={handleReject} variant="destructive" className="flex-1" disabled={updateStatus.isPending}>
                      <X size={16} />
                      Tolak
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Submit Confirmation Dialog */}
      <ConfirmDialog
        open={isSubmitDialogOpen}
        onOpenChange={setIsSubmitDialogOpen}
        title="Ajukan Surat"
        description="Apakah Anda yakin ingin mengajukan surat ini? Pastikan jenis surat yang dipilih sudah benar."
        confirmText="Ajukan"
        variant="info"
        isLoading={createSurat.isPending}
        onConfirm={confirmSubmit}
      />

      {/* Process Confirmation Dialog */}
      <ConfirmDialog
        open={isProcessDialogOpen}
        onOpenChange={setIsProcessDialogOpen}
        title="Proses Surat"
        description="Apakah Anda yakin ingin memproses pengajuan surat ini? Status akan berubah menjadi 'Diproses'."
        confirmText="Proses"
        variant="info"
        isLoading={updateStatus.isPending}
        onConfirm={confirmProcess}
      />

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
        title="Setujui Surat"
        description="Apakah Anda yakin ingin menyetujui pengajuan surat ini? Surat akan dapat diunduh oleh pemohon."
        confirmText="Setujui"
        variant="info"
        isLoading={updateStatus.isPending}
        onConfirm={confirmApprove}
      />

      {/* Reject Confirmation Dialog */}
      <ConfirmDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        title="Tolak Surat"
        description={`Apakah Anda yakin ingin menolak pengajuan surat ini dengan alasan: "${rejectReason}"?`}
        confirmText="Tolak"
        variant="danger"
        isLoading={updateStatus.isPending}
        onConfirm={confirmReject}
      />
    </div>
  );
};

export default SuratManagement;

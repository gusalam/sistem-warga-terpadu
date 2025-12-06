import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePendudukList, useCreatePenduduk, useUpdatePenduduk, useDeletePenduduk, PendudukWithRT } from '@/hooks/usePendudukData';
import { useRTList } from '@/hooks/useRTData';
import { useCreateUser } from '@/hooks/useCreateUser';
import { useDeleteUser } from '@/hooks/useDeleteUser';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Pencil, Trash2, Search, Mail, Lock, Loader2, Download } from 'lucide-react';
import { exportToCSV, formatDate, formatGender, ExportColumn } from '@/lib/exportUtils';
import { toast } from 'sonner';

const PendudukManagement: React.FC = () => {
  const { role, profile } = useAuth();
  const isAdmin = role === 'admin';
  const isRW = role === 'rw';
  const isRT = role === 'rt';
  const canExport = isAdmin || isRW || isRT;
  
  // Filter based on role
  const rtIdFilter = isRT ? profile?.rt_id || undefined : undefined;
  const rwIdFilter = isRW ? profile?.rw_id || undefined : undefined;
  
  const { data: pendudukList = [], isLoading } = usePendudukList(rtIdFilter, rwIdFilter);
  const { data: rtList = [] } = useRTList(rwIdFilter);
  const createPenduduk = useCreatePenduduk();
  const updatePenduduk = useUpdatePenduduk();
  const deletePenduduk = useDeletePenduduk();
  const deleteUser = useDeleteUser();
  const createUser = useCreateUser();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRTFilter, setSelectedRTFilter] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<PendudukWithRT | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [editingPenduduk, setEditingPenduduk] = useState<PendudukWithRT | null>(null);
  const [selectedPenduduk, setSelectedPenduduk] = useState<PendudukWithRT | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    alamat: '',
    phone: '',
    jenis_kelamin: 'L',
    tanggal_lahir: '',
    rt_id: '',
  });
  const [accountData, setAccountData] = useState({ email: '', password: '' });

  const availableRTs = isRW 
    ? rtList
    : isRT
    ? rtList.filter(rt => rt.id === profile?.rt_id)
    : rtList;

  const filteredPenduduk = pendudukList.filter((p) => {
    const matchesSearch =
      p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nik.includes(searchTerm) ||
      (p.alamat?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRT = selectedRTFilter === 'all' || p.rt_id === selectedRTFilter;
    return matchesSearch && matchesRT;
  });

  const handleAdd = () => {
    setEditingPenduduk(null);
    setFormData({
      nama: '',
      nik: '',
      alamat: '',
      phone: '',
      jenis_kelamin: 'L',
      tanggal_lahir: '',
      rt_id: isRT && profile?.rt_id ? profile.rt_id : '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (penduduk: PendudukWithRT) => {
    setEditingPenduduk(penduduk);
    setFormData({
      nama: penduduk.nama,
      nik: penduduk.nik,
      alamat: penduduk.alamat || '',
      phone: penduduk.phone || '',
      jenis_kelamin: penduduk.jenis_kelamin || 'L',
      tanggal_lahir: penduduk.tanggal_lahir || '',
      rt_id: penduduk.rt_id,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (penduduk: PendudukWithRT) => {
    setDeleteTarget(penduduk);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    // If penduduk has linked account, delete the auth user first (this will cascade)
    if (deleteTarget.user_id) {
      deleteUser.mutate(
        { user_id: deleteTarget.user_id, penduduk_id: deleteTarget.id },
        {
          onSuccess: () => {
            // After user deleted, also delete penduduk data
            deletePenduduk.mutate(deleteTarget.id);
            setIsDeleteDialogOpen(false);
            setDeleteTarget(null);
          },
          onError: () => {
            setIsDeleteDialogOpen(false);
            setDeleteTarget(null);
          }
        }
      );
    } else {
      // No linked account, just delete penduduk data
      deletePenduduk.mutate(deleteTarget.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setDeleteTarget(null);
        },
      });
    }
  };

  const handleCreateAccount = (penduduk: PendudukWithRT) => {
    setSelectedPenduduk(penduduk);
    setAccountData({ email: '', password: '' });
    setIsAccountDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaveDialogOpen(true);
  };

  const confirmSave = () => {
    if (editingPenduduk) {
      updatePenduduk.mutate({ id: editingPenduduk.id, data: formData }, {
        onSuccess: () => {
          setIsSaveDialogOpen(false);
          setIsDialogOpen(false);
        },
      });
    } else {
      createPenduduk.mutate(formData, {
        onSuccess: () => {
          setIsSaveDialogOpen(false);
          setIsDialogOpen(false);
        },
      });
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPenduduk) return;

    createUser.mutate({
      email: accountData.email,
      password: accountData.password,
      nama: selectedPenduduk.nama,
      role: 'penduduk',
      rt_id: selectedPenduduk.rt_id,
      penduduk_id: selectedPenduduk.id,
    }, {
      onSuccess: () => {
        setIsAccountDialogOpen(false);
      },
    });
  };

  const handleExport = () => {
    const exportColumns: ExportColumn<PendudukWithRT>[] = [
      { key: 'nama', header: 'Nama' },
      { key: 'nik', header: 'NIK' },
      { key: 'jenis_kelamin', header: 'Jenis Kelamin', render: (p) => formatGender(p.jenis_kelamin) },
      { key: 'tanggal_lahir', header: 'Tanggal Lahir', render: (p) => formatDate(p.tanggal_lahir) },
      { key: 'alamat', header: 'Alamat', render: (p) => p.alamat || '-' },
      { key: 'phone', header: 'No. HP', render: (p) => p.phone || '-' },
      { key: 'rt_nama', header: 'RT', render: (p) => p.rt_nama || '-' },
      { key: 'status_kependudukan', header: 'Status', render: (p) => p.status_kependudukan || '-' },
      { key: 'punya_akun', header: 'Punya Akun', render: (p) => p.user_id ? 'Ya' : 'Tidak' },
    ];

    const dataToExport = filteredPenduduk.length > 0 ? filteredPenduduk : pendudukList;
    const filename = `data-penduduk-${new Date().toISOString().split('T')[0]}`;
    
    exportToCSV(dataToExport, exportColumns, filename);
    toast.success(`Berhasil export ${dataToExport.length} data penduduk`);
  };

  const columns: Column<PendudukWithRT>[] = [
    { key: 'nama', header: 'Nama' },
    { key: 'nik', header: 'NIK' },
    ...(isRW
      ? [
          {
            key: 'rt_nama' as keyof PendudukWithRT,
            header: 'RT',
            render: (p: PendudukWithRT) => p.rt_nama || '-',
          },
        ]
      : []),
    { 
      key: 'jenis_kelamin', 
      header: 'L/P',
      className: 'text-center',
      render: (p: PendudukWithRT) => p.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'
    },
    { 
      key: 'alamat', 
      header: 'Alamat',
      render: (p: PendudukWithRT) => p.alamat || '-'
    },
    {
      key: 'user_id',
      header: 'Status Akun',
      className: 'text-center',
      render: (p: PendudukWithRT) =>
        p.user_id ? (
          <StatusBadge status="Punya Akun" variant="success" />
        ) : (
          <StatusBadge status="Belum" variant="default" />
        ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'text-right',
      render: (p: PendudukWithRT) => (
        <div className="flex items-center justify-end gap-2">
          {isRT && !p.user_id && (
            <Button size="sm" variant="outline" onClick={() => handleCreateAccount(p)}>
              <Mail size={14} />
              Buat Akun
            </Button>
          )}
          {isRT && (
            <>
              <Button size="sm" variant="ghost" onClick={() => handleEdit(p)}>
                <Pencil size={14} />
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(p)}>
                <Trash2 size={14} />
              </Button>
            </>
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
        title="Data Penduduk"
        description={isRT ? 'Kelola data penduduk di RT Anda' : 'Lihat data penduduk di wilayah Anda'}
        actions={
          <div className="flex gap-2">
            {canExport && (
              <Button variant="outline" onClick={handleExport}>
                <Download size={18} />
                Export CSV
              </Button>
            )}
            {isRT && (
              <Button onClick={handleAdd}>
                <Plus size={18} />
                Tambah Penduduk
              </Button>
            )}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Total Penduduk</p>
          <p className="text-2xl font-bold">{pendudukList.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Laki-laki</p>
          <p className="text-2xl font-bold">{pendudukList.filter(p => p.jenis_kelamin === 'L').length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Perempuan</p>
          <p className="text-2xl font-bold">{pendudukList.filter(p => p.jenis_kelamin === 'P').length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Punya Akun</p>
          <p className="text-2xl font-bold">{pendudukList.filter(p => p.user_id).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Cari nama, NIK, atau alamat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {isRW && (
          <Select value={selectedRTFilter} onValueChange={setSelectedRTFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter RT" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua RT</SelectItem>
              {availableRTs.map((rt) => (
                <SelectItem key={rt.id} value={rt.id}>
                  {rt.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredPenduduk} emptyMessage="Tidak ada data penduduk" />

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPenduduk ? 'Edit Penduduk' : 'Tambah Penduduk Baru'}</DialogTitle>
            <DialogDescription>
              {editingPenduduk ? 'Perbarui informasi penduduk' : 'Masukkan informasi penduduk baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  placeholder="Nama lengkap"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nik">NIK</Label>
                <Input
                  id="nik"
                  placeholder="16 digit NIK"
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  maxLength={16}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                  <Select
                    value={formData.jenis_kelamin}
                    onValueChange={(value) => setFormData({ ...formData, jenis_kelamin: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Laki-laki</SelectItem>
                      <SelectItem value="P">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                  <Input
                    id="tanggal_lahir"
                    type="date"
                    value={formData.tanggal_lahir}
                    onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Input
                  id="alamat"
                  placeholder="Alamat lengkap"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. HP</Label>
                <Input
                  id="phone"
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit">
                {editingPenduduk ? 'Simpan' : 'Tambah'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Account Dialog */}
      <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Akun Penduduk</DialogTitle>
            <DialogDescription>
              Buat akun login untuk {selectedPenduduk?.nama}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAccountSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="penduduk-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="penduduk-email"
                    type="email"
                    placeholder="email@contoh.com"
                    value={accountData.email}
                    onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="penduduk-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="penduduk-password"
                    type="password"
                    placeholder="Minimal 8 karakter"
                    value={accountData.password}
                    onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                    className="pl-10"
                    minLength={8}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAccountDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Buat Akun
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Hapus Data Penduduk"
        description={
          deleteTarget?.user_id
            ? `Apakah Anda yakin ingin menghapus ${deleteTarget?.nama}? Akun login yang terkait juga akan dihapus secara permanen.`
            : `Apakah Anda yakin ingin menghapus ${deleteTarget?.nama}? Data ini tidak dapat dikembalikan.`
        }
        confirmText="Hapus"
        variant="danger"
        isLoading={deleteUser.isPending || deletePenduduk.isPending}
        onConfirm={confirmDelete}
      />

      {/* Save Confirmation Dialog */}
      <ConfirmDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        title={editingPenduduk ? 'Simpan Perubahan' : 'Tambah Penduduk'}
        description={editingPenduduk ? 'Apakah Anda yakin ingin menyimpan perubahan data penduduk ini?' : 'Apakah Anda yakin ingin menambahkan data penduduk baru ini?'}
        confirmText={editingPenduduk ? 'Simpan' : 'Tambah'}
        variant="info"
        isLoading={createPenduduk.isPending || updatePenduduk.isPending}
        onConfirm={confirmSave}
      />
    </div>
  );
};

export default PendudukManagement;

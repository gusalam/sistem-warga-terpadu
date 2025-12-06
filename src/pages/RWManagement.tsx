import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useRWList, useCreateRW, useUpdateRW, useDeleteRW, RWWithStats } from '@/hooks/useRWData';
import { useCreateUser } from '@/hooks/useCreateUser';
import { Plus, Pencil, Trash2, Search, Mail, Lock, Loader2 } from 'lucide-react';

const RWManagement: React.FC = () => {
  const { data: rwList = [], isLoading } = useRWList();
  const createRW = useCreateRW();
  const updateRW = useUpdateRW();
  const deleteRW = useDeleteRW();
  const createUser = useCreateUser();

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [editingRW, setEditingRW] = useState<RWWithStats | null>(null);
  const [selectedRW, setSelectedRW] = useState<RWWithStats | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RWWithStats | null>(null);
  const [formData, setFormData] = useState({ nomor: '', nama: '', alamat: '' });
  const [accountData, setAccountData] = useState({ email: '', password: '', nama_ketua: '' });

  const filteredRW = rwList.filter(
    (rw) =>
      rw.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rw.nomor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rw.ketua_nama?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingRW(null);
    setFormData({ nomor: '', nama: '', alamat: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (rw: RWWithStats) => {
    setEditingRW(rw);
    setFormData({ nomor: rw.nomor, nama: rw.nama, alamat: rw.alamat || '' });
    setIsDialogOpen(true);
  };

  const handleDelete = (rw: RWWithStats) => {
    setDeleteTarget(rw);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteRW.mutate(deleteTarget.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setDeleteTarget(null);
        },
      });
    }
  };

  const handleCreateAccount = (rw: RWWithStats) => {
    setSelectedRW(rw);
    setAccountData({ email: '', password: '', nama_ketua: '' });
    setIsAccountDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaveDialogOpen(true);
  };

  const confirmSave = () => {
    if (editingRW) {
      updateRW.mutate({ id: editingRW.id, data: formData }, {
        onSuccess: () => {
          setIsSaveDialogOpen(false);
          setIsDialogOpen(false);
        },
      });
    } else {
      createRW.mutate(formData, {
        onSuccess: () => {
          setIsSaveDialogOpen(false);
          setIsDialogOpen(false);
        },
      });
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRW) return;

    createUser.mutate({
      email: accountData.email,
      password: accountData.password,
      nama: accountData.nama_ketua,
      role: 'rw',
      rw_id: selectedRW.id,
    }, {
      onSuccess: () => {
        setIsAccountDialogOpen(false);
      },
    });
  };

  const columns: Column<RWWithStats>[] = [
    { key: 'nomor', header: 'Nomor RW' },
    { key: 'nama', header: 'Nama RW' },
    { 
      key: 'ketua_nama', 
      header: 'Ketua RW',
      render: (rw) => rw.ketua_nama || <span className="text-muted-foreground italic">Belum ada</span>
    },
    {
      key: 'jumlah_rt',
      header: 'Jumlah RT',
      className: 'text-center',
      render: (rw) => <span className="font-medium">{rw.jumlah_rt}</span>,
    },
    {
      key: 'jumlah_penduduk',
      header: 'Jumlah Penduduk',
      className: 'text-center',
      render: (rw) => <span className="font-medium">{rw.jumlah_penduduk}</span>,
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'text-right',
      render: (rw) => (
        <div className="flex items-center justify-end gap-2">
          {!rw.ketua_id && (
            <Button size="sm" variant="outline" onClick={() => handleCreateAccount(rw)}>
              <Mail size={14} />
              Buat Akun
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => handleEdit(rw)}>
            <Pencil size={14} />
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(rw)}>
            <Trash2 size={14} />
          </Button>
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
        title="Kelola RW"
        description="Tambah, edit, atau hapus data RW"
        actions={
          <Button onClick={handleAdd}>
            <Plus size={18} />
            Tambah RW
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Cari RW atau Ketua..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredRW} emptyMessage="Tidak ada data RW" />

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRW ? 'Edit RW' : 'Tambah RW Baru'}</DialogTitle>
            <DialogDescription>
              {editingRW ? 'Perbarui informasi RW' : 'Masukkan informasi RW baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nomor">Nomor RW</Label>
                <Input
                  id="nomor"
                  placeholder="Contoh: 001"
                  value={formData.nomor}
                  onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama">Nama RW</Label>
                <Input
                  id="nama"
                  placeholder="Contoh: RW 001 Kelurahan..."
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat (Opsional)</Label>
                <Input
                  id="alamat"
                  placeholder="Alamat RW"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit">
                {editingRW ? 'Simpan' : 'Tambah'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Account Dialog */}
      <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Akun Ketua RW</DialogTitle>
            <DialogDescription>
              Buat akun login untuk Ketua {selectedRW?.nama}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAccountSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nama_ketua">Nama Ketua</Label>
                <Input
                  id="nama_ketua"
                  placeholder="Nama lengkap ketua RW"
                  value={accountData.nama_ketua}
                  onChange={(e) => setAccountData({ ...accountData, nama_ketua: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="email"
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
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="password"
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
        title="Hapus RW"
        description={`Apakah Anda yakin ingin menghapus ${deleteTarget?.nama}? Data RT dan profil terkait akan terputus dari RW ini.`}
        confirmText="Hapus"
        variant="danger"
        isLoading={deleteRW.isPending}
        onConfirm={confirmDelete}
      />

      {/* Save Confirmation Dialog */}
      <ConfirmDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        title={editingRW ? 'Simpan Perubahan' : 'Tambah RW'}
        description={editingRW ? 'Apakah Anda yakin ingin menyimpan perubahan data RW ini?' : 'Apakah Anda yakin ingin menambahkan RW baru ini?'}
        confirmText={editingRW ? 'Simpan' : 'Tambah'}
        variant="info"
        isLoading={createRW.isPending || updateRW.isPending}
        onConfirm={confirmSave}
      />
    </div>
  );
};

export default RWManagement;

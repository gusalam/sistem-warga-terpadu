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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRTList, useCreateRT, useUpdateRT, useDeleteRT, RTWithStats } from '@/hooks/useRTData';
import { useRWList } from '@/hooks/useRWData';
import { useCreateUser } from '@/hooks/useCreateUser';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Pencil, Trash2, Search, Mail, Lock, Loader2 } from 'lucide-react';

const RTManagement: React.FC = () => {
  const { role, profile } = useAuth();
  const isAdmin = role === 'admin';
  const isRW = role === 'rw';
  
  // If RW, only show RT in their RW
  const rwIdFilter = isRW ? profile?.rw_id || undefined : undefined;
  
  const { data: rtList = [], isLoading } = useRTList(rwIdFilter);
  const { data: rwList = [] } = useRWList();
  const createRT = useCreateRT();
  const updateRT = useUpdateRT();
  const deleteRT = useDeleteRT();
  const createUser = useCreateUser();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRWFilter, setSelectedRWFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [editingRT, setEditingRT] = useState<RTWithStats | null>(null);
  const [selectedRT, setSelectedRT] = useState<RTWithStats | null>(null);
  const [formData, setFormData] = useState({ nomor: '', nama: '', rw_id: '', alamat: '' });
  const [accountData, setAccountData] = useState({ email: '', password: '', nama_ketua: '' });

  const filteredRT = rtList.filter((rt) => {
    const matchesSearch =
      rt.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rt.nomor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rt.ketua_nama?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRW = selectedRWFilter === 'all' || rt.rw_id === selectedRWFilter;
    return matchesSearch && matchesRW;
  });

  const handleAdd = () => {
    setEditingRT(null);
    setFormData({ 
      nomor: '', 
      nama: '', 
      rw_id: isRW && profile?.rw_id ? profile.rw_id : '', 
      alamat: '' 
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (rt: RTWithStats) => {
    setEditingRT(rt);
    setFormData({ nomor: rt.nomor, nama: rt.nama, rw_id: rt.rw_id, alamat: rt.alamat || '' });
    setIsDialogOpen(true);
  };

  const handleDelete = async (rt: RTWithStats) => {
    if (confirm(`Hapus ${rt.nama}?`)) {
      deleteRT.mutate(rt.id);
    }
  };

  const handleCreateAccount = (rt: RTWithStats) => {
    setSelectedRT(rt);
    setAccountData({ email: '', password: '', nama_ketua: '' });
    setIsAccountDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRT) {
      updateRT.mutate({ id: editingRT.id, data: formData });
    } else {
      createRT.mutate(formData);
    }
    setIsDialogOpen(false);
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRT) return;

    createUser.mutate({
      email: accountData.email,
      password: accountData.password,
      nama: accountData.nama_ketua,
      role: 'rt',
      rt_id: selectedRT.id,
      rw_id: selectedRT.rw_id,
    }, {
      onSuccess: () => {
        setIsAccountDialogOpen(false);
      },
    });
  };

  const columns: Column<RTWithStats>[] = [
    { key: 'nomor', header: 'Nomor RT' },
    { key: 'nama', header: 'Nama RT' },
    ...(isAdmin
      ? [
          {
            key: 'rw_nama' as keyof RTWithStats,
            header: 'RW',
            render: (rt: RTWithStats) => rt.rw_nama || '-',
          },
        ]
      : []),
    { 
      key: 'ketua_nama', 
      header: 'Ketua RT',
      render: (rt: RTWithStats) => rt.ketua_nama || <span className="text-muted-foreground italic">Belum ada</span>
    },
    {
      key: 'jumlah_penduduk',
      header: 'Jumlah Penduduk',
      className: 'text-center',
      render: (rt: RTWithStats) => <span className="font-medium">{rt.jumlah_penduduk}</span>,
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'text-right',
      render: (rt: RTWithStats) => (
        <div className="flex items-center justify-end gap-2">
          {!rt.ketua_id && (
            <Button size="sm" variant="outline" onClick={() => handleCreateAccount(rt)}>
              <Mail size={14} />
              Buat Akun
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => handleEdit(rt)}>
            <Pencil size={14} />
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(rt)}>
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
        title="Kelola RT"
        description={isAdmin ? 'Kelola semua RT di seluruh RW' : 'Kelola RT di wilayah Anda'}
        actions={
          <Button onClick={handleAdd}>
            <Plus size={18} />
            Tambah RT
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Cari RT atau Ketua..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {isAdmin && (
          <Select value={selectedRWFilter} onValueChange={setSelectedRWFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter RW" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua RW</SelectItem>
              {rwList.map((rw) => (
                <SelectItem key={rw.id} value={rw.id}>
                  {rw.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredRT} emptyMessage="Tidak ada data RT" />

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRT ? 'Edit RT' : 'Tambah RT Baru'}</DialogTitle>
            <DialogDescription>
              {editingRT ? 'Perbarui informasi RT' : 'Masukkan informasi RT baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {isAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="rw">RW</Label>
                  <Select
                    value={formData.rw_id}
                    onValueChange={(value) => setFormData({ ...formData, rw_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih RW" />
                    </SelectTrigger>
                    <SelectContent>
                      {rwList.map((rw) => (
                        <SelectItem key={rw.id} value={rw.id}>
                          {rw.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="nomor">Nomor RT</Label>
                <Input
                  id="nomor"
                  placeholder="Contoh: 001"
                  value={formData.nomor}
                  onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama">Nama RT</Label>
                <Input
                  id="nama"
                  placeholder="Contoh: RT 001"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat (Opsional)</Label>
                <Input
                  id="alamat"
                  placeholder="Alamat RT"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createRT.isPending || updateRT.isPending}>
                {(createRT.isPending || updateRT.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingRT ? 'Simpan' : 'Tambah'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Account Dialog */}
      <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Akun Ketua RT</DialogTitle>
            <DialogDescription>
              Buat akun login untuk Ketua {selectedRT?.nama}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAccountSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nama_ketua">Nama Ketua</Label>
                <Input
                  id="nama_ketua"
                  placeholder="Nama lengkap ketua RT"
                  value={accountData.nama_ketua}
                  onChange={(e) => setAccountData({ ...accountData, nama_ketua: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="account-email"
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
                <Label htmlFor="account-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="account-password"
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
    </div>
  );
};

export default RTManagement;

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePengumumanList, useCreatePengumuman, useUpdatePengumuman, useDeletePengumuman } from '@/hooks/useSupabaseData';
import { useRealtimePengumuman } from '@/hooks/useRealtimePengumuman';
import { useAuth } from '@/contexts/AuthContext';
import { AppRole, Pengumuman } from '@/lib/types';
import { Plus, Megaphone, Calendar, User, Pin, Loader2, Radio, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const PengumumanPage: React.FC = () => {
  const { user, role, profile } = useAuth();
  const isPenduduk = role === 'penduduk';
  const isRT = role === 'rt';
  const isRW = role === 'rw';
  const isAdmin = role === 'admin';
  
  // Enable realtime updates
  useRealtimePengumuman();
  
  const { data: pengumumanList = [], isLoading } = usePengumumanList();
  const createPengumuman = useCreatePengumuman();
  const updatePengumuman = useUpdatePengumuman();
  const deletePengumuman = useDeletePengumuman();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPengumuman, setEditingPengumuman] = useState<Pengumuman | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    judul: '',
    isi: '',
    target_audience: [] as AppRole[],
    is_pinned: false,
  });

  const handleAdd = () => {
    setEditingPengumuman(null);
    setFormData({ judul: '', isi: '', target_audience: [], is_pinned: false });
    setIsDialogOpen(true);
  };

  const handleEdit = (pengumuman: Pengumuman) => {
    setEditingPengumuman(pengumuman);
    setFormData({
      judul: pengumuman.judul,
      isi: pengumuman.isi,
      target_audience: pengumuman.target_audience || [],
      is_pinned: pengumuman.is_pinned || false,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    await deletePengumuman.mutateAsync(deletingId);
    setIsDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPengumuman) {
      await updatePengumuman.mutateAsync({
        id: editingPengumuman.id,
        judul: formData.judul,
        isi: formData.isi,
        target_audience: formData.target_audience.length > 0 ? formData.target_audience : null,
        is_pinned: formData.is_pinned,
      });
    } else {
      await createPengumuman.mutateAsync({
        judul: formData.judul,
        isi: formData.isi,
        target_audience: formData.target_audience.length > 0 ? formData.target_audience : undefined,
        is_pinned: formData.is_pinned,
        rt_id: isRT ? profile?.rt_id || undefined : undefined,
        rw_id: isRW ? profile?.rw_id || undefined : undefined,
      });
    }
    
    setIsDialogOpen(false);
  };

  const toggleTargetAudience = (targetRole: AppRole) => {
    setFormData(prev => ({
      ...prev,
      target_audience: prev.target_audience.includes(targetRole)
        ? prev.target_audience.filter(r => r !== targetRole)
        : [...prev.target_audience, targetRole]
    }));
  };

  const getTargetLabel = (audience: AppRole[] | null) => {
    if (!audience || audience.length === 0) return 'Semua';
    const labels: Record<AppRole, string> = {
      admin: 'Admin',
      rw: 'RW',
      rt: 'RT',
      penduduk: 'Penduduk',
    };
    return audience.map(r => labels[r]).join(', ');
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: localeId });
    } catch {
      return dateString;
    }
  };

  const canEditDelete = (pengumuman: Pengumuman) => {
    if (isAdmin) return true;
    return pengumuman.author_id === user?.id;
  };

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
        title="Pengumuman"
        description={isPenduduk ? 'Lihat pengumuman dari RT/RW' : 'Buat dan kelola pengumuman'}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Radio className="h-3 w-3 text-success animate-pulse" />
              <span>Realtime</span>
            </div>
            {!isPenduduk && (
              <Button onClick={handleAdd}>
                <Plus size={18} />
                Buat Pengumuman
              </Button>
            )}
          </div>
        }
      />

      {/* Pengumuman List */}
      <div className="space-y-4">
        {pengumumanList.length === 0 ? (
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            <Megaphone className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h3 className="font-semibold text-lg mb-2">Belum Ada Pengumuman</h3>
            <p className="text-muted-foreground">Pengumuman akan muncul di sini</p>
          </div>
        ) : (
          pengumumanList.map((pengumuman) => (
            <div
              key={pengumuman.id}
              className={`bg-card rounded-xl p-6 border transition-shadow hover:shadow-md ${
                pengumuman.is_pinned ? 'border-primary/50 bg-primary/5' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {pengumuman.is_pinned && (
                      <div className="flex items-center gap-1 text-primary text-sm font-medium">
                        <Pin size={14} />
                        Disematkan
                      </div>
                    )}
                    <StatusBadge 
                      status={getTargetLabel(pengumuman.target_audience)} 
                      variant="info" 
                    />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{pengumuman.judul}</h3>
                  <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{pengumuman.isi}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      {pengumuman.rt?.nama || pengumuman.rw?.nama || 'Admin'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(pengumuman.published_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Megaphone size={24} />
                  </div>
                  {canEditDelete(pengumuman) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(pengumuman)}>
                          <Edit2 size={14} className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(pengumuman.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 size={14} className="mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Pengumuman Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPengumuman ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}</DialogTitle>
            <DialogDescription>
              {editingPengumuman ? 'Ubah informasi pengumuman' : 'Buat pengumuman untuk warga'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="judul">Judul Pengumuman</Label>
                <Input
                  id="judul"
                  placeholder="Judul pengumuman"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Target Penerima</Label>
                <div className="flex flex-wrap gap-4">
                  {(isRW || isAdmin) && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="target-rt"
                        checked={formData.target_audience.includes('rt')}
                        onCheckedChange={() => toggleTargetAudience('rt')}
                      />
                      <Label htmlFor="target-rt" className="font-normal">Ketua RT</Label>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="target-penduduk"
                      checked={formData.target_audience.includes('penduduk')}
                      onCheckedChange={() => toggleTargetAudience('penduduk')}
                    />
                    <Label htmlFor="target-penduduk" className="font-normal">Penduduk</Label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Kosongkan untuk mengirim ke semua
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_pinned"
                  checked={formData.is_pinned}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_pinned: !!checked })}
                />
                <Label htmlFor="is_pinned" className="font-normal">Sematkan pengumuman ini</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isi">Isi Pengumuman</Label>
                <Textarea
                  id="isi"
                  placeholder="Tulis isi pengumuman..."
                  value={formData.isi}
                  onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                  rows={4}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createPengumuman.isPending || updatePengumuman.isPending}>
                {(createPengumuman.isPending || updatePengumuman.isPending) ? 'Menyimpan...' : 
                  editingPengumuman ? 'Update' : 'Publikasikan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengumuman?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Pengumuman akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePengumuman.isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PengumumanPage;
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
import { usePengumumanList, useCreatePengumuman } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { AppRole } from '@/lib/types';
import { Plus, Megaphone, Calendar, User, Pin, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const PengumumanPage: React.FC = () => {
  const { role, profile } = useAuth();
  const isPenduduk = role === 'penduduk';
  const isRT = role === 'rt';
  const isRW = role === 'rw';
  const isAdmin = role === 'admin';
  
  const { data: pengumumanList = [], isLoading } = usePengumumanList();
  const createPengumuman = useCreatePengumuman();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    isi: '',
    target_audience: [] as AppRole[],
    is_pinned: false,
  });

  const handleAdd = () => {
    setFormData({ judul: '', isi: '', target_audience: [], is_pinned: false });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createPengumuman.mutateAsync({
      judul: formData.judul,
      isi: formData.isi,
      target_audience: formData.target_audience.length > 0 ? formData.target_audience : undefined,
      is_pinned: formData.is_pinned,
      rt_id: isRT ? profile?.rt_id || undefined : undefined,
      rw_id: isRW ? profile?.rw_id || undefined : undefined,
    });
    
    setIsDialogOpen(false);
  };

  const toggleTargetAudience = (role: AppRole) => {
    setFormData(prev => ({
      ...prev,
      target_audience: prev.target_audience.includes(role)
        ? prev.target_audience.filter(r => r !== role)
        : [...prev.target_audience, role]
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
          !isPenduduk && (
            <Button onClick={handleAdd}>
              <Plus size={18} />
              Buat Pengumuman
            </Button>
          )
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
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Megaphone size={24} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Pengumuman Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Pengumuman Baru</DialogTitle>
            <DialogDescription>Buat pengumuman untuk warga</DialogDescription>
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
              <Button type="submit" disabled={createPengumuman.isPending}>
                {createPengumuman.isPending ? 'Menyimpan...' : 'Publikasikan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PengumumanPage;
import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
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
import { dummyPengumuman, Pengumuman } from '@/lib/dummy-data';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Megaphone, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';

const PengumumanPage: React.FC = () => {
  const { user } = useAuth();
  const isPenduduk = user?.role === 'penduduk';
  const isRT = user?.role === 'rt';
  const isRW = user?.role === 'rw';
  
  const [pengumumanList, setPengumumanList] = useState<Pengumuman[]>(dummyPengumuman);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    isi: '',
    role_target: 'semua' as Pengumuman['role_target'],
  });

  const handleAdd = () => {
    setFormData({ judul: '', isi: '', role_target: 'semua' });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPengumuman: Pengumuman = {
      id: `pg${Date.now()}`,
      judul: formData.judul,
      isi: formData.isi,
      role_target: formData.role_target,
      tanggal: new Date().toISOString().split('T')[0],
      pembuat: isRT ? 'RT' : isRW ? 'RW' : 'Admin',
    };
    setPengumumanList([newPengumuman, ...pengumumanList]);
    toast.success('Pengumuman berhasil dibuat');
    setIsDialogOpen(false);
  };

  const getTargetLabel = (target: Pengumuman['role_target']) => {
    const labels: Record<Pengumuman['role_target'], string> = {
      semua: 'Semua',
      rw: 'RW',
      rt: 'RT',
      penduduk: 'Penduduk',
    };
    return labels[target];
  };

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
              className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge 
                      status={getTargetLabel(pengumuman.role_target)} 
                      variant="info" 
                    />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{pengumuman.judul}</h3>
                  <p className="text-muted-foreground mb-4">{pengumuman.isi}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      {pengumuman.pembuat}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {pengumuman.tanggal}
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
                <Label htmlFor="role_target">Target Penerima</Label>
                <Select
                  value={formData.role_target}
                  onValueChange={(value: Pengumuman['role_target']) => 
                    setFormData({ ...formData, role_target: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua</SelectItem>
                    {isRW && <SelectItem value="rt">Ketua RT</SelectItem>}
                    <SelectItem value="penduduk">Penduduk</SelectItem>
                  </SelectContent>
                </Select>
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
              <Button type="submit">Publikasikan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PengumumanPage;

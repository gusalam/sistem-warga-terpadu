import React, { useState, useRef } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useMyPendudukData, useRTList, useRWList, useUpdateProfile, uploadAvatar } from '@/hooks/useSupabaseData';
import { UserCircle, Mail, Phone, MapPin, Calendar, CreditCard, Home, Building2, Loader2, Camera, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

const ProfilPage: React.FC = () => {
  const { user, profile, role, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: penduduk, isLoading: loadingPenduduk } = useMyPendudukData();
  const { data: rtList = [] } = useRTList();
  const { data: rwList = [] } = useRWList();
  const updateProfile = useUpdateProfile();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    phone: '',
    alamat: '',
  });
  
  const rt = rtList.find(r => r.id === profile?.rt_id);
  const rw = rwList.find(r => r.id === profile?.rw_id) || (rt?.rw as any);

  const getRoleLabel = () => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'rw': return 'Ketua RW';
      case 'rt': return 'Ketua RT';
      case 'penduduk': return 'Penduduk';
      default: return 'User';
    }
  };

  const handleEditClick = () => {
    setFormData({
      nama: profile?.nama || '',
      phone: profile?.phone || '',
      alamat: profile?.alamat || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    await updateProfile.mutateAsync({
      id: user.id,
      ...formData,
    });
    
    setIsEditDialogOpen(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const avatarUrl = await uploadAvatar(user.id, file);
      await updateProfile.mutateAsync({
        id: user.id,
        avatar_url: avatarUrl,
      });
      await refreshProfile();
    } catch (error: any) {
      toast.error(`Gagal upload foto: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const profileData = [
    { icon: CreditCard, label: 'NIK', value: penduduk?.nik || profile?.nik || '-' },
    { icon: Mail, label: 'Email', value: user?.email || profile?.email || '-' },
    { icon: Phone, label: 'No. HP', value: penduduk?.phone || profile?.phone || '-' },
    { icon: Calendar, label: 'Tanggal Lahir', value: penduduk?.tanggal_lahir || '-' },
    { icon: MapPin, label: 'Alamat', value: penduduk?.alamat || profile?.alamat || '-' },
    { icon: Home, label: 'RT', value: rt?.nama || penduduk?.rt?.nama || '-' },
    { icon: Building2, label: 'RW', value: rw?.nama || penduduk?.rt?.rw?.nama || '-' },
  ];

  if (loadingPenduduk) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <PageHeader
        title="Profil Saya"
        description="Informasi data diri Anda"
        actions={
          <Button onClick={handleEditClick} variant="outline">
            <Edit2 size={18} />
            Edit Profil
          </Button>
        }
      />

      <div className="max-w-2xl">
        {/* Profile Card */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="gradient-primary p-8 text-center">
            <div className="relative inline-block">
              <Avatar className="w-24 h-24 border-4 border-primary-foreground/20">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.nama || 'User'} />
                <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-2xl">
                  {profile?.nama ? getInitials(profile.nama) : <UserCircle size={48} />}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-background text-foreground shadow-lg hover:bg-accent transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Camera size={16} />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <h2 className="text-2xl font-bold text-primary-foreground mt-4">{profile?.nama || 'User'}</h2>
            <p className="text-primary-foreground/80 mt-1">{getRoleLabel()}</p>
          </div>

          {/* Profile Info */}
          <div className="p-6 space-y-4">
            {profileData.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <item.icon size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-accent rounded-lg">
          <p className="text-sm text-accent-foreground">
            Jika ada data yang tidak sesuai, silakan hubungi RT setempat untuk melakukan perubahan data.
          </p>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profil</DialogTitle>
            <DialogDescription>Ubah informasi profil Anda</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. HP</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Textarea
                  id="alamat"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilPage;
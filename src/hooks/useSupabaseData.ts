import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  RW, RT, Penduduk, Surat, Laporan, Pengumuman,
  CreateRWInput, CreateRTInput, CreatePendudukInput, 
  CreateSuratInput, CreateLaporanInput, CreatePengumumanInput,
  SuratStatus, LaporanStatus
} from '@/lib/types';
import { toast } from 'sonner';

// ============ RW Hooks ============
export function useRWList() {
  return useQuery({
    queryKey: ['rw-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rw')
        .select('*')
        .order('nomor');
      
      if (error) throw error;
      return data as RW[];
    },
  });
}

export function useCreateRW() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateRWInput) => {
      const { data, error } = await supabase
        .from('rw')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rw-list'] });
      toast.success('RW berhasil ditambahkan');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambah RW: ${error.message}`);
    },
  });
}

// ============ RT Hooks ============
export function useRTList(rwId?: string) {
  return useQuery({
    queryKey: ['rt-list', rwId],
    queryFn: async () => {
      let query = supabase
        .from('rt')
        .select('*, rw:rw_id(*)')
        .order('nomor');
      
      if (rwId) {
        query = query.eq('rw_id', rwId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as RT[];
    },
  });
}

export function useCreateRT() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateRTInput) => {
      const { data, error } = await supabase
        .from('rt')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rt-list'] });
      toast.success('RT berhasil ditambahkan');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambah RT: ${error.message}`);
    },
  });
}

// ============ Penduduk Hooks ============
export function usePendudukList(rtId?: string) {
  return useQuery({
    queryKey: ['penduduk-list', rtId],
    queryFn: async () => {
      let query = supabase
        .from('penduduk')
        .select('*, rt:rt_id(*, rw:rw_id(*))')
        .order('nama');
      
      if (rtId) {
        query = query.eq('rt_id', rtId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Penduduk[];
    },
  });
}

export function useMyPendudukData() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-penduduk', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('penduduk')
        .select('*, rt:rt_id(*, rw:rw_id(*))')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Penduduk | null;
    },
    enabled: !!user?.id,
  });
}

export function useCreatePenduduk() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreatePendudukInput) => {
      const { data, error } = await supabase
        .from('penduduk')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['penduduk-list'] });
      toast.success('Penduduk berhasil ditambahkan');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambah penduduk: ${error.message}`);
    },
  });
}

export function useUpdatePenduduk() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Penduduk> & { id: string }) => {
      const { data, error } = await supabase
        .from('penduduk')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['penduduk-list'] });
      toast.success('Data penduduk berhasil diupdate');
    },
    onError: (error: Error) => {
      toast.error(`Gagal update penduduk: ${error.message}`);
    },
  });
}

// ============ Surat Hooks ============
export function useSuratList(rtId?: string) {
  return useQuery({
    queryKey: ['surat-list', rtId],
    queryFn: async () => {
      let query = supabase
        .from('surat')
        .select('*, penduduk:penduduk_id(nama, nik), rt:rt_id(nama, nomor)')
        .order('created_at', { ascending: false });
      
      if (rtId) {
        query = query.eq('rt_id', rtId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Surat[];
    },
  });
}

export function useMySuratList() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-surat', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // First get penduduk id
      const { data: pendudukData } = await supabase
        .from('penduduk')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!pendudukData) return [];
      
      const { data, error } = await supabase
        .from('surat')
        .select('*, penduduk:penduduk_id(nama, nik), rt:rt_id(nama, nomor)')
        .eq('penduduk_id', pendudukData.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Surat[];
    },
    enabled: !!user?.id,
  });
}

export function useCreateSurat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateSuratInput) => {
      const { data, error } = await supabase
        .from('surat')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surat-list'] });
      queryClient.invalidateQueries({ queryKey: ['my-surat'] });
      toast.success('Pengajuan surat berhasil dibuat');
    },
    onError: (error: Error) => {
      toast.error(`Gagal membuat pengajuan: ${error.message}`);
    },
  });
}

export function useUpdateSuratStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, status, catatan }: { id: string; status: SuratStatus; catatan?: string }) => {
      const { data, error } = await supabase
        .from('surat')
        .update({ 
          status, 
          catatan,
          processed_by: user?.id,
          processed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surat-list'] });
      toast.success('Status surat berhasil diupdate');
    },
    onError: (error: Error) => {
      toast.error(`Gagal update status: ${error.message}`);
    },
  });
}

// ============ Laporan Hooks ============
export function useLaporanList(rtId?: string) {
  return useQuery({
    queryKey: ['laporan-list', rtId],
    queryFn: async () => {
      let query = supabase
        .from('laporan')
        .select('*, penduduk:penduduk_id(nama, nik), rt:rt_id(nama, nomor)')
        .order('created_at', { ascending: false });
      
      if (rtId) {
        query = query.eq('rt_id', rtId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Laporan[];
    },
  });
}

export function useMyLaporanList() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-laporan', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: pendudukData } = await supabase
        .from('penduduk')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!pendudukData) return [];
      
      const { data, error } = await supabase
        .from('laporan')
        .select('*, penduduk:penduduk_id(nama, nik), rt:rt_id(nama, nomor)')
        .eq('penduduk_id', pendudukData.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Laporan[];
    },
    enabled: !!user?.id,
  });
}

export function useCreateLaporan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateLaporanInput) => {
      const { data, error } = await supabase
        .from('laporan')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporan-list'] });
      queryClient.invalidateQueries({ queryKey: ['my-laporan'] });
      toast.success('Laporan berhasil dibuat');
    },
    onError: (error: Error) => {
      toast.error(`Gagal membuat laporan: ${error.message}`);
    },
  });
}

export function useUpdateLaporanStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, status, tanggapan }: { id: string; status: LaporanStatus; tanggapan?: string }) => {
      const { data, error } = await supabase
        .from('laporan')
        .update({ 
          status, 
          tanggapan,
          processed_by: user?.id,
          processed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporan-list'] });
      toast.success('Status laporan berhasil diupdate');
    },
    onError: (error: Error) => {
      toast.error(`Gagal update status: ${error.message}`);
    },
  });
}

// ============ Pengumuman Hooks ============
export function usePengumumanList() {
  return useQuery({
    queryKey: ['pengumuman-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pengumuman')
        .select('*, rt:rt_id(nama, nomor), rw:rw_id(nama, nomor)')
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data as Pengumuman[];
    },
  });
}

export function useCreatePengumuman() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (input: CreatePengumumanInput) => {
      const { data, error } = await supabase
        .from('pengumuman')
        .insert({
          ...input,
          author_id: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pengumuman-list'] });
      toast.success('Pengumuman berhasil dibuat');
    },
    onError: (error: Error) => {
      toast.error(`Gagal membuat pengumuman: ${error.message}`);
    },
  });
}

export function useUpdatePengumuman() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Pengumuman> & { id: string }) => {
      const { data, error } = await supabase
        .from('pengumuman')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pengumuman-list'] });
      toast.success('Pengumuman berhasil diupdate');
    },
    onError: (error: Error) => {
      toast.error(`Gagal update pengumuman: ${error.message}`);
    },
  });
}

export function useDeletePengumuman() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pengumuman')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pengumuman-list'] });
      toast.success('Pengumuman berhasil dihapus');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus pengumuman: ${error.message}`);
    },
  });
}

// ============ Profile Hooks ============
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { refreshProfile } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<{ id: string; nama: string; phone: string; alamat: string; avatar_url: string }>) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ['my-penduduk'] });
      toast.success('Profil berhasil diupdate');
    },
    onError: (error: Error) => {
      toast.error(`Gagal update profil: ${error.message}`);
    },
  });
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true });
  
  if (uploadError) throw uploadError;
  
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);
  
  return data.publicUrl;
}

// ============ Dashboard Stats Hooks ============
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [rwResult, rtResult, pendudukResult, suratPendingResult, laporanPendingResult] = await Promise.all([
        supabase.from('rw').select('id', { count: 'exact', head: true }),
        supabase.from('rt').select('id', { count: 'exact', head: true }),
        supabase.from('penduduk').select('id', { count: 'exact', head: true }),
        supabase.from('surat').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('laporan').select('id', { count: 'exact', head: true }).in('status', ['pending', 'diproses']),
      ]);
      
      return {
        totalRW: rwResult.count || 0,
        totalRT: rtResult.count || 0,
        totalPenduduk: pendudukResult.count || 0,
        suratPending: suratPendingResult.count || 0,
        laporanPending: laporanPendingResult.count || 0,
      };
    },
  });
}

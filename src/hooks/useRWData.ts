import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RWWithStats {
  id: string;
  nomor: string;
  nama: string;
  ketua_id: string | null;
  alamat: string | null;
  created_at: string;
  updated_at: string;
  ketua_nama?: string;
  jumlah_rt: number;
  jumlah_penduduk: number;
}

export function useRWList() {
  return useQuery({
    queryKey: ['rw-list'],
    queryFn: async (): Promise<RWWithStats[]> => {
      // Fetch RW list
      const { data: rwData, error: rwError } = await supabase
        .from('rw')
        .select('*')
        .order('nomor');

      if (rwError) throw rwError;

      // Get ketua names
      const ketuaIds = rwData.filter(rw => rw.ketua_id).map(rw => rw.ketua_id as string);
      let ketuaMap: Record<string, string> = {};
      
      if (ketuaIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, nama')
          .in('id', ketuaIds);
        
        if (profiles) {
          ketuaMap = Object.fromEntries(profiles.map(p => [p.id, p.nama]));
        }
      }

      // Get RT counts per RW
      const { data: rtCounts } = await supabase
        .from('rt')
        .select('rw_id');

      const rtCountMap: Record<string, number> = {};
      rtCounts?.forEach(rt => {
        rtCountMap[rt.rw_id] = (rtCountMap[rt.rw_id] || 0) + 1;
      });

      // Get penduduk counts per RW (via RT)
      const { data: pendudukCounts } = await supabase
        .from('penduduk')
        .select('rt_id, rt!inner(rw_id)');

      const pendudukCountMap: Record<string, number> = {};
      pendudukCounts?.forEach((p: any) => {
        const rwId = p.rt?.rw_id;
        if (rwId) {
          pendudukCountMap[rwId] = (pendudukCountMap[rwId] || 0) + 1;
        }
      });

      return rwData.map(rw => ({
        ...rw,
        ketua_nama: rw.ketua_id ? ketuaMap[rw.ketua_id] : undefined,
        jumlah_rt: rtCountMap[rw.id] || 0,
        jumlah_penduduk: pendudukCountMap[rw.id] || 0,
      }));
    },
  });
}

export function useCreateRW() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { nomor: string; nama: string; alamat?: string }) => {
      const { data: result, error } = await supabase
        .from('rw')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rw-list'] });
      toast.success('RW berhasil ditambahkan');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambahkan RW: ${error.message}`);
    },
  });
}

export function useUpdateRW() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { nomor?: string; nama?: string; alamat?: string } }) => {
      const { data: result, error } = await supabase
        .from('rw')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rw-list'] });
      toast.success('RW berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error(`Gagal memperbarui RW: ${error.message}`);
    },
  });
}

export function useDeleteRW() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rw')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rw-list'] });
      toast.success('RW berhasil dihapus');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus RW: ${error.message}`);
    },
  });
}

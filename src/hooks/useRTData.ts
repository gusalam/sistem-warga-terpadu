import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RTWithStats {
  id: string;
  rw_id: string;
  nomor: string;
  nama: string;
  ketua_id: string | null;
  alamat: string | null;
  created_at: string;
  updated_at: string;
  ketua_nama?: string;
  rw_nama?: string;
  jumlah_penduduk: number;
}

export function useRTList(rwId?: string) {
  return useQuery({
    queryKey: ['rt-list', rwId],
    queryFn: async (): Promise<RTWithStats[]> => {
      let query = supabase
        .from('rt')
        .select('*, rw:rw_id(nama)')
        .order('nomor');

      if (rwId) {
        query = query.eq('rw_id', rwId);
      }

      const { data: rtData, error: rtError } = await query;

      if (rtError) throw rtError;

      // Get ketua names
      const ketuaIds = rtData.filter(rt => rt.ketua_id).map(rt => rt.ketua_id as string);
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

      // Get penduduk counts per RT
      const rtIds = rtData.map(rt => rt.id);
      const { data: pendudukCounts } = await supabase
        .from('penduduk')
        .select('rt_id')
        .in('rt_id', rtIds);

      const pendudukCountMap: Record<string, number> = {};
      pendudukCounts?.forEach(p => {
        pendudukCountMap[p.rt_id] = (pendudukCountMap[p.rt_id] || 0) + 1;
      });

      return rtData.map((rt: any) => ({
        id: rt.id,
        rw_id: rt.rw_id,
        nomor: rt.nomor,
        nama: rt.nama,
        ketua_id: rt.ketua_id,
        alamat: rt.alamat,
        created_at: rt.created_at,
        updated_at: rt.updated_at,
        ketua_nama: rt.ketua_id ? ketuaMap[rt.ketua_id] : undefined,
        rw_nama: rt.rw?.nama,
        jumlah_penduduk: pendudukCountMap[rt.id] || 0,
      }));
    },
  });
}

export function useCreateRT() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { rw_id: string; nomor: string; nama: string; alamat?: string }) => {
      const { data: result, error } = await supabase
        .from('rt')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rt-list'] });
      toast.success('RT berhasil ditambahkan');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambahkan RT: ${error.message}`);
    },
  });
}

export function useUpdateRT() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { nomor?: string; nama?: string; alamat?: string; rw_id?: string } }) => {
      const { data: result, error } = await supabase
        .from('rt')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rt-list'] });
      toast.success('RT berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error(`Gagal memperbarui RT: ${error.message}`);
    },
  });
}

export function useDeleteRT() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rt')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rt-list'] });
      toast.success('RT berhasil dihapus');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus RT: ${error.message}`);
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Penduduk, CreatePendudukInput } from '@/lib/types';

export interface PendudukWithRT extends Penduduk {
  rt_nama?: string;
  rw_id?: string;
}

export function usePendudukList(rtId?: string, rwId?: string) {
  return useQuery({
    queryKey: ['penduduk-list', rtId, rwId],
    queryFn: async (): Promise<PendudukWithRT[]> => {
      let query = supabase
        .from('penduduk')
        .select('*, rt:rt_id(nama, rw_id)')
        .order('nama');

      if (rtId) {
        query = query.eq('rt_id', rtId);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data;

      // If rwId is provided, filter by RW
      if (rwId && !rtId) {
        filteredData = data.filter((p: any) => p.rt?.rw_id === rwId);
      }

      return filteredData.map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        nik: p.nik,
        nama: p.nama,
        tempat_lahir: p.tempat_lahir,
        tanggal_lahir: p.tanggal_lahir,
        jenis_kelamin: p.jenis_kelamin,
        agama: p.agama,
        status_perkawinan: p.status_perkawinan,
        pekerjaan: p.pekerjaan,
        alamat: p.alamat,
        rt_id: p.rt_id,
        no_kk: p.no_kk,
        status_kependudukan: p.status_kependudukan,
        phone: p.phone,
        created_at: p.created_at,
        updated_at: p.updated_at,
        rt_nama: p.rt?.nama,
        rw_id: p.rt?.rw_id,
      }));
    },
  });
}

export function useCreatePenduduk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePendudukInput) => {
      const { data: result, error } = await supabase
        .from('penduduk')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['penduduk-list'] });
      toast.success('Penduduk berhasil ditambahkan');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambahkan penduduk: ${error.message}`);
    },
  });
}

export function useUpdatePenduduk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreatePendudukInput> }) => {
      const { data: result, error } = await supabase
        .from('penduduk')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['penduduk-list'] });
      toast.success('Penduduk berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error(`Gagal memperbarui penduduk: ${error.message}`);
    },
  });
}

export function useDeletePenduduk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('penduduk')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['penduduk-list'] });
      toast.success('Penduduk berhasil dihapus');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus penduduk: ${error.message}`);
    },
  });
}

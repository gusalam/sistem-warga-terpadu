import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Laporan, CreateLaporanInput, LaporanStatus } from '@/lib/types';

export interface LaporanWithPenduduk extends Laporan {
  penduduk_nama?: string;
  rt_nama?: string;
}

export function useLaporanList(rtId?: string, pendudukId?: string) {
  return useQuery({
    queryKey: ['laporan-list', rtId, pendudukId],
    queryFn: async (): Promise<LaporanWithPenduduk[]> => {
      let query = supabase
        .from('laporan')
        .select('*, penduduk:penduduk_id(nama), rt:rt_id(nama)')
        .order('created_at', { ascending: false });

      if (rtId) {
        query = query.eq('rt_id', rtId);
      }

      if (pendudukId) {
        query = query.eq('penduduk_id', pendudukId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map((l: any) => ({
        id: l.id,
        judul: l.judul,
        deskripsi: l.deskripsi,
        kategori: l.kategori,
        penduduk_id: l.penduduk_id,
        rt_id: l.rt_id,
        status: l.status as LaporanStatus,
        prioritas: l.prioritas,
        tanggapan: l.tanggapan,
        processed_by: l.processed_by,
        processed_at: l.processed_at,
        created_at: l.created_at,
        updated_at: l.updated_at,
        penduduk_nama: l.penduduk?.nama,
        rt_nama: l.rt?.nama,
      }));
    },
  });
}

export function useCreateLaporan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLaporanInput) => {
      const { data: result, error } = await supabase
        .from('laporan')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporan-list'] });
      toast.success('Laporan berhasil dikirim');
    },
    onError: (error: Error) => {
      toast.error(`Gagal mengirim laporan: ${error.message}`);
    },
  });
}

export function useUpdateLaporanStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      tanggapan,
      processed_by 
    }: { 
      id: string; 
      status: LaporanStatus; 
      tanggapan?: string;
      processed_by?: string;
    }) => {
      const updateData: Record<string, any> = { 
        status,
        processed_at: new Date().toISOString(),
      };

      if (tanggapan !== undefined) updateData.tanggapan = tanggapan;
      if (processed_by) updateData.processed_by = processed_by;

      const { data: result, error } = await supabase
        .from('laporan')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporan-list'] });
      toast.success('Status laporan berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error(`Gagal memperbarui status: ${error.message}`);
    },
  });
}

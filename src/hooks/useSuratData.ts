import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Surat, CreateSuratInput, SuratStatus } from '@/lib/types';

export interface SuratWithPenduduk extends Surat {
  penduduk_nama?: string;
  penduduk_nik?: string;
  penduduk_alamat?: string;
  rt_nama?: string;
  rw_nama?: string;
}

export function useSuratList(rtId?: string, pendudukId?: string) {
  return useQuery({
    queryKey: ['surat-list', rtId, pendudukId],
    queryFn: async (): Promise<SuratWithPenduduk[]> => {
      let query = supabase
        .from('surat')
        .select('*, penduduk:penduduk_id(nama, nik, alamat), rt:rt_id(nama, rw:rw_id(nama))')
        .order('created_at', { ascending: false });

      if (rtId) {
        query = query.eq('rt_id', rtId);
      }

      if (pendudukId) {
        query = query.eq('penduduk_id', pendudukId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map((s: any) => ({
        id: s.id,
        nomor_surat: s.nomor_surat,
        jenis_surat: s.jenis_surat,
        penduduk_id: s.penduduk_id,
        rt_id: s.rt_id,
        keperluan: s.keperluan,
        status: s.status as SuratStatus,
        catatan: s.catatan,
        processed_by: s.processed_by,
        processed_at: s.processed_at,
        created_at: s.created_at,
        updated_at: s.updated_at,
        penduduk_nama: s.penduduk?.nama,
        penduduk_nik: s.penduduk?.nik,
        penduduk_alamat: s.penduduk?.alamat,
        rt_nama: s.rt?.nama,
        rw_nama: s.rt?.rw?.nama,
      }));
    },
  });
}

export function useCreateSurat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSuratInput) => {
      const { data: result, error } = await supabase
        .from('surat')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surat-list'] });
      toast.success('Pengajuan surat berhasil dikirim');
    },
    onError: (error: Error) => {
      toast.error(`Gagal mengajukan surat: ${error.message}`);
    },
  });
}

export function useUpdateSuratStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      catatan,
      processed_by 
    }: { 
      id: string; 
      status: SuratStatus; 
      catatan?: string;
      processed_by?: string;
    }) => {
      const updateData: Record<string, any> = { 
        status,
        processed_at: new Date().toISOString(),
      };

      if (catatan !== undefined) updateData.catatan = catatan;
      if (processed_by) updateData.processed_by = processed_by;

      const { data: result, error } = await supabase
        .from('surat')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surat-list'] });
      toast.success('Status surat berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error(`Gagal memperbarui status: ${error.message}`);
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateUserParams {
  email: string;
  password: string;
  nama: string;
  role: 'rw' | 'rt' | 'penduduk';
  rw_id?: string;
  rt_id?: string;
  penduduk_id?: string;
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateUserParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Anda harus login terlebih dahulu');
      }

      const response = await supabase.functions.invoke('create-user', {
        body: params,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Gagal membuat akun');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rw-list'] });
      queryClient.invalidateQueries({ queryKey: ['rt-list'] });
      queryClient.invalidateQueries({ queryKey: ['penduduk-list'] });
      toast.success(data.message || 'Akun berhasil dibuat');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

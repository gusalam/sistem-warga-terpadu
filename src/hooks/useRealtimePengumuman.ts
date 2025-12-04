import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Pengumuman } from '@/lib/types';

export function useRealtimePengumuman() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('pengumuman-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pengumuman',
        },
        (payload) => {
          const newPengumuman = payload.new as Pengumuman;
          
          // Invalidate the query to refetch
          queryClient.invalidateQueries({ queryKey: ['pengumuman-list'] });
          
          // Show toast notification
          toast.info('Pengumuman Baru', {
            description: newPengumuman.judul,
            duration: 5000,
            action: {
              label: 'Lihat',
              onClick: () => {
                // Scroll to top or navigate
                window.scrollTo({ top: 0, behavior: 'smooth' });
              },
            },
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pengumuman',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['pengumuman-list'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'pengumuman',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['pengumuman-list'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

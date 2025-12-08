import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface Banner {
  id: string;
  judul: string;
  deskripsi: string | null;
  gambar_url: string;
  link_url: string | null;
  urutan: number;
}

export interface Berita {
  id: string;
  judul: string;
  ringkasan: string | null;
  konten: string;
  gambar_url: string | null;
  published_at: string | null;
}

export interface Agenda {
  id: string;
  judul: string;
  deskripsi: string | null;
  tanggal: string;
  waktu: string | null;
  lokasi: string | null;
}

export const useBanners = () => {
  return useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banner')
        .select('id, judul, deskripsi, gambar_url, link_url, urutan')
        .eq('is_active', true)
        .order('urutan', { ascending: true });
      
      if (error) throw error;
      return data as Banner[];
    },
  });
};

export const useBerita = (limit = 3) => {
  return useQuery({
    queryKey: ['berita', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('berita')
        .select('id, judul, ringkasan, konten, gambar_url, published_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as Berita[];
    },
  });
};

export const useAgenda = (limit = 3) => {
  return useQuery({
    queryKey: ['agenda', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agenda')
        .select('id, judul, deskripsi, tanggal, waktu, lokasi')
        .eq('is_active', true)
        .gte('tanggal', new Date().toISOString().split('T')[0])
        .order('tanggal', { ascending: true })
        .limit(limit);
      
      if (error) throw error;
      return data as Agenda[];
    },
  });
};

export const useRealtimeHome = (refetchFns: (() => void)[]) => {
  useEffect(() => {
    const channel = supabase
      .channel('home-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banner' }, () => {
        refetchFns.forEach(fn => fn());
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'berita' }, () => {
        refetchFns.forEach(fn => fn());
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agenda' }, () => {
        refetchFns.forEach(fn => fn());
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchFns]);
};

import { useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import HomeHeader from '@/components/home/HomeHeader';
import HeroBanner from '@/components/home/HeroBanner';
import QuickAccess from '@/components/home/QuickAccess';
import BeritaTerkini from '@/components/home/BeritaTerkini';
import AgendaKegiatan from '@/components/home/AgendaKegiatan';
import FloatingActions from '@/components/home/FloatingActions';
import HomeFooter from '@/components/home/HomeFooter';
import { useBanners, useBerita, useAgenda, useRealtimeHome } from '@/hooks/useHomeData';

const Index = () => {
  const { data: banners = [], isLoading: bannersLoading, refetch: refetchBanners } = useBanners();
  const { data: berita = [], isLoading: beritaLoading, refetch: refetchBerita } = useBerita(3);
  const { data: agenda = [], isLoading: agendaLoading, refetch: refetchAgenda } = useAgenda(3);

  useRealtimeHome([refetchBanners, refetchBerita, refetchAgenda]);

  return (
    <>
      <Helmet>
        <title>RW 10 — Beranda | Kelurahan yang Ramah & Harmonis</title>
        <meta name="description" content="Portal resmi RW 10 Jakarta Utara. Akses informasi terkini, berita, agenda kegiatan, layanan surat, dan aspirasi warga." />
        <meta name="keywords" content="RW 10, Jakarta Utara, kelurahan, komunitas, berita warga, layanan publik" />
        <link rel="canonical" href="/" />
        
        {/* Open Graph */}
        <meta property="og:title" content="RW 10 — Beranda" />
        <meta property="og:description" content="Portal resmi RW 10 Jakarta Utara. Kelurahan yang Ramah & Harmonis." />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="id_ID" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <HomeHeader />
        
        <main>
          <HeroBanner banners={banners} isLoading={bannersLoading} />
          <QuickAccess />
          <BeritaTerkini berita={berita} isLoading={beritaLoading} />
          <AgendaKegiatan agenda={agenda} isLoading={agendaLoading} />
        </main>
        
        <HomeFooter />
        <FloatingActions />
      </div>
    </>
  );
};

export default Index;
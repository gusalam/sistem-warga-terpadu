-- Create banner table for hero carousel
CREATE TABLE public.banner (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  judul VARCHAR NOT NULL,
  deskripsi TEXT,
  gambar_url TEXT NOT NULL,
  link_url TEXT,
  urutan INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create berita table for news
CREATE TABLE public.berita (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  judul VARCHAR NOT NULL,
  ringkasan TEXT,
  konten TEXT NOT NULL,
  gambar_url TEXT,
  author_id UUID NOT NULL,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create agenda table for events
CREATE TABLE public.agenda (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  judul VARCHAR NOT NULL,
  deskripsi TEXT,
  tanggal DATE NOT NULL,
  waktu TIME,
  lokasi VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.banner ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda ENABLE ROW LEVEL SECURITY;

-- Banner policies (public read, admin manage)
CREATE POLICY "Anyone can view active banners"
ON public.banner FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage banners"
ON public.banner FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Berita policies (public read published, admin/rw manage)
CREATE POLICY "Anyone can view published berita"
ON public.berita FOR SELECT
USING (is_published = true AND published_at <= now());

CREATE POLICY "Admins can manage all berita"
ON public.berita FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "RW ketua can manage berita"
ON public.berita FOR ALL
USING (has_role(auth.uid(), 'rw'::app_role));

-- Agenda policies (public read active, admin/rw manage)
CREATE POLICY "Anyone can view active agenda"
ON public.agenda FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all agenda"
ON public.agenda FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "RW ketua can manage agenda"
ON public.agenda FOR ALL
USING (has_role(auth.uid(), 'rw'::app_role));

-- Update triggers
CREATE TRIGGER update_banner_updated_at
BEFORE UPDATE ON public.banner
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_berita_updated_at
BEFORE UPDATE ON public.berita
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agenda_updated_at
BEFORE UPDATE ON public.agenda
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.banner;
ALTER PUBLICATION supabase_realtime ADD TABLE public.berita;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agenda;
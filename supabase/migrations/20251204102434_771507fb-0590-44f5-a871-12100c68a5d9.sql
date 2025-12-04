-- 1. Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'rw', 'rt', 'penduduk');

-- 2. Create user_roles table (CRITICAL: roles must be in separate table)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Create RW table (wilayah RW)
CREATE TABLE public.rw (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor VARCHAR(10) NOT NULL UNIQUE,
  nama VARCHAR(255) NOT NULL,
  ketua_id UUID REFERENCES auth.users(id),
  alamat TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.rw ENABLE ROW LEVEL SECURITY;

-- 5. Create RT table (wilayah RT under RW)
CREATE TABLE public.rt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rw_id UUID REFERENCES public.rw(id) ON DELETE CASCADE NOT NULL,
  nomor VARCHAR(10) NOT NULL,
  nama VARCHAR(255) NOT NULL,
  ketua_id UUID REFERENCES auth.users(id),
  alamat TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(rw_id, nomor)
);

ALTER TABLE public.rt ENABLE ROW LEVEL SECURITY;

-- 6. Create profiles table (user info)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama VARCHAR(255) NOT NULL,
  nik VARCHAR(16) UNIQUE,
  email VARCHAR(255),
  phone VARCHAR(20),
  alamat TEXT,
  rt_id UUID REFERENCES public.rt(id),
  rw_id UUID REFERENCES public.rw(id),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. Create penduduk table (detailed resident data)
CREATE TABLE public.penduduk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nik VARCHAR(16) NOT NULL UNIQUE,
  nama VARCHAR(255) NOT NULL,
  tempat_lahir VARCHAR(100),
  tanggal_lahir DATE,
  jenis_kelamin VARCHAR(20),
  agama VARCHAR(50),
  status_perkawinan VARCHAR(50),
  pekerjaan VARCHAR(100),
  alamat TEXT,
  rt_id UUID REFERENCES public.rt(id) NOT NULL,
  no_kk VARCHAR(16),
  status_kependudukan VARCHAR(50) DEFAULT 'tetap',
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.penduduk ENABLE ROW LEVEL SECURITY;

-- 8. Create surat table (document requests)
CREATE TABLE public.surat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_surat VARCHAR(50),
  jenis_surat VARCHAR(100) NOT NULL,
  penduduk_id UUID REFERENCES public.penduduk(id) ON DELETE CASCADE NOT NULL,
  rt_id UUID REFERENCES public.rt(id) NOT NULL,
  keperluan TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'diproses', 'selesai', 'ditolak')),
  catatan TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.surat ENABLE ROW LEVEL SECURITY;

-- 9. Create laporan table (reports/complaints)
CREATE TABLE public.laporan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul VARCHAR(255) NOT NULL,
  deskripsi TEXT NOT NULL,
  kategori VARCHAR(100),
  penduduk_id UUID REFERENCES public.penduduk(id) ON DELETE CASCADE NOT NULL,
  rt_id UUID REFERENCES public.rt(id) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'diproses', 'ditindaklanjuti', 'selesai', 'ditolak')),
  prioritas VARCHAR(20) DEFAULT 'normal' CHECK (prioritas IN ('rendah', 'normal', 'tinggi', 'urgent')),
  tanggapan TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.laporan ENABLE ROW LEVEL SECURITY;

-- 10. Create pengumuman table (announcements)
CREATE TABLE public.pengumuman (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul VARCHAR(255) NOT NULL,
  isi TEXT NOT NULL,
  target_audience app_role[],
  rw_id UUID REFERENCES public.rw(id),
  rt_id UUID REFERENCES public.rt(id),
  is_pinned BOOLEAN DEFAULT false,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pengumuman ENABLE ROW LEVEL SECURITY;

-- 11. Helper function to get user's RT ID
CREATE OR REPLACE FUNCTION public.get_user_rt_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rt_id FROM public.profiles WHERE id = _user_id
$$;

-- 12. Helper function to get user's RW ID
CREATE OR REPLACE FUNCTION public.get_user_rw_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT rw_id FROM public.profiles WHERE id = _user_id),
    (SELECT rw_id FROM public.rt WHERE ketua_id = _user_id),
    (SELECT id FROM public.rw WHERE ketua_id = _user_id)
  )
$$;

-- 13. Helper function to check if user is RT ketua of specific RT
CREATE OR REPLACE FUNCTION public.is_rt_ketua(_user_id UUID, _rt_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.rt WHERE ketua_id = _user_id AND id = _rt_id
  )
$$;

-- 14. Helper function to check if user is RW ketua
CREATE OR REPLACE FUNCTION public.is_rw_ketua(_user_id UUID, _rw_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.rw WHERE ketua_id = _user_id AND id = _rw_id
  )
$$;

-- 15. Get RW ID from RT
CREATE OR REPLACE FUNCTION public.get_rw_from_rt(_rt_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rw_id FROM public.rt WHERE id = _rt_id
$$;

-- ========== RLS POLICIES ==========

-- user_roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- rw policies
CREATE POLICY "Anyone authenticated can view RW" ON public.rw
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage RW" ON public.rw
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "RW ketua can update own RW" ON public.rw
  FOR UPDATE USING (ketua_id = auth.uid());

-- rt policies  
CREATE POLICY "Anyone authenticated can view RT" ON public.rt
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage RT" ON public.rt
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "RW ketua can manage RT in their RW" ON public.rt
  FOR ALL USING (public.is_rw_ketua(auth.uid(), rw_id));

CREATE POLICY "RT ketua can update own RT" ON public.rt
  FOR UPDATE USING (ketua_id = auth.uid());

-- profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "RW ketua can view profiles in their RW" ON public.profiles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'rw') AND 
    (rw_id IN (SELECT id FROM public.rw WHERE ketua_id = auth.uid()) OR
     rt_id IN (SELECT id FROM public.rt WHERE rw_id IN (SELECT id FROM public.rw WHERE ketua_id = auth.uid())))
  );

CREATE POLICY "RT ketua can view profiles in their RT" ON public.profiles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'rt') AND 
    rt_id IN (SELECT id FROM public.rt WHERE ketua_id = auth.uid())
  );

-- penduduk policies
CREATE POLICY "Penduduk can view own data" ON public.penduduk
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Penduduk can update own data" ON public.penduduk
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all penduduk" ON public.penduduk
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "RW ketua can view penduduk in their RW" ON public.penduduk
  FOR SELECT USING (
    public.has_role(auth.uid(), 'rw') AND 
    rt_id IN (SELECT id FROM public.rt WHERE rw_id IN (SELECT id FROM public.rw WHERE ketua_id = auth.uid()))
  );

CREATE POLICY "RT ketua can manage penduduk in their RT" ON public.penduduk
  FOR ALL USING (
    public.has_role(auth.uid(), 'rt') AND 
    rt_id IN (SELECT id FROM public.rt WHERE ketua_id = auth.uid())
  );

-- surat policies
CREATE POLICY "Penduduk can view own surat" ON public.surat
  FOR SELECT USING (
    penduduk_id IN (SELECT id FROM public.penduduk WHERE user_id = auth.uid())
  );

CREATE POLICY "Penduduk can create surat" ON public.surat
  FOR INSERT WITH CHECK (
    penduduk_id IN (SELECT id FROM public.penduduk WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all surat" ON public.surat
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "RW ketua can view surat in their RW" ON public.surat
  FOR SELECT USING (
    public.has_role(auth.uid(), 'rw') AND 
    rt_id IN (SELECT id FROM public.rt WHERE rw_id IN (SELECT id FROM public.rw WHERE ketua_id = auth.uid()))
  );

CREATE POLICY "RT ketua can manage surat in their RT" ON public.surat
  FOR ALL USING (
    public.has_role(auth.uid(), 'rt') AND 
    rt_id IN (SELECT id FROM public.rt WHERE ketua_id = auth.uid())
  );

-- laporan policies
CREATE POLICY "Penduduk can view own laporan" ON public.laporan
  FOR SELECT USING (
    penduduk_id IN (SELECT id FROM public.penduduk WHERE user_id = auth.uid())
  );

CREATE POLICY "Penduduk can create laporan" ON public.laporan
  FOR INSERT WITH CHECK (
    penduduk_id IN (SELECT id FROM public.penduduk WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all laporan" ON public.laporan
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "RW ketua can view laporan in their RW" ON public.laporan
  FOR SELECT USING (
    public.has_role(auth.uid(), 'rw') AND 
    rt_id IN (SELECT id FROM public.rt WHERE rw_id IN (SELECT id FROM public.rw WHERE ketua_id = auth.uid()))
  );

CREATE POLICY "RT ketua can manage laporan in their RT" ON public.laporan
  FOR ALL USING (
    public.has_role(auth.uid(), 'rt') AND 
    rt_id IN (SELECT id FROM public.rt WHERE ketua_id = auth.uid())
  );

-- pengumuman policies
CREATE POLICY "Anyone authenticated can view published pengumuman" ON public.pengumuman
  FOR SELECT TO authenticated USING (
    published_at <= now() AND (expires_at IS NULL OR expires_at > now())
  );

CREATE POLICY "Admins can manage all pengumuman" ON public.pengumuman
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "RW ketua can manage pengumuman for their RW" ON public.pengumuman
  FOR ALL USING (
    public.has_role(auth.uid(), 'rw') AND 
    (author_id = auth.uid() OR rw_id IN (SELECT id FROM public.rw WHERE ketua_id = auth.uid()))
  );

CREATE POLICY "RT ketua can manage pengumuman for their RT" ON public.pengumuman
  FOR ALL USING (
    public.has_role(auth.uid(), 'rt') AND 
    (author_id = auth.uid() OR rt_id IN (SELECT id FROM public.rt WHERE ketua_id = auth.uid()))
  );

-- ========== TRIGGERS ==========

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rw_updated_at BEFORE UPDATE ON public.rw
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rt_updated_at BEFORE UPDATE ON public.rt
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_penduduk_updated_at BEFORE UPDATE ON public.penduduk
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_surat_updated_at BEFORE UPDATE ON public.surat
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_laporan_updated_at BEFORE UPDATE ON public.laporan
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pengumuman_updated_at BEFORE UPDATE ON public.pengumuman
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nama, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nama', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.surat;
ALTER PUBLICATION supabase_realtime ADD TABLE public.laporan;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pengumuman;
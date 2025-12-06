-- Fix FK constraint for profiles.rt_id - set to ON DELETE SET NULL
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_rt_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_rt_id_fkey 
  FOREIGN KEY (rt_id) REFERENCES public.rt(id) ON DELETE SET NULL;

-- Fix FK constraint for profiles.rw_id - set to ON DELETE SET NULL
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_rw_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_rw_id_fkey 
  FOREIGN KEY (rw_id) REFERENCES public.rw(id) ON DELETE SET NULL;

-- Fix FK constraint for rt.rw_id - set to ON DELETE SET NULL  
ALTER TABLE public.rt DROP CONSTRAINT IF EXISTS rt_rw_id_fkey;
ALTER TABLE public.rt ADD CONSTRAINT rt_rw_id_fkey 
  FOREIGN KEY (rw_id) REFERENCES public.rw(id) ON DELETE SET NULL;

-- Fix FK constraint for penduduk.rt_id - set to ON DELETE SET NULL
ALTER TABLE public.penduduk DROP CONSTRAINT IF EXISTS penduduk_rt_id_fkey;
ALTER TABLE public.penduduk ADD CONSTRAINT penduduk_rt_id_fkey 
  FOREIGN KEY (rt_id) REFERENCES public.rt(id) ON DELETE SET NULL;
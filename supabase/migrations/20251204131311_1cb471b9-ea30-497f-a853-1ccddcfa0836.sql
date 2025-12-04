-- Insert sample RW data
INSERT INTO public.rw (id, nomor, nama, alamat) VALUES
  ('11111111-1111-1111-1111-111111111111', '001', 'RW 001', 'Jl. Merdeka Raya No. 1'),
  ('22222222-2222-2222-2222-222222222222', '002', 'RW 002', 'Jl. Sudirman No. 15'),
  ('33333333-3333-3333-3333-333333333333', '003', 'RW 003', 'Jl. Gatot Subroto No. 8');

-- Insert sample RT data for RW 001
INSERT INTO public.rt (id, rw_id, nomor, nama, alamat) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '001', 'RT 001', 'Gang Melati No. 1'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '002', 'RT 002', 'Gang Mawar No. 5'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', '003', 'RT 003', 'Gang Dahlia No. 3');

-- Insert sample RT data for RW 002
INSERT INTO public.rt (id, rw_id, nomor, nama, alamat) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', '001', 'RT 001', 'Gang Anggrek No. 2'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', '002', 'RT 002', 'Gang Kenanga No. 7');

-- Insert sample RT data for RW 003
INSERT INTO public.rt (id, rw_id, nomor, nama, alamat) VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333', '001', 'RT 001', 'Gang Cempaka No. 4'),
  ('00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', '002', 'RT 002', 'Gang Seroja No. 9'),
  ('00000000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', '003', 'RT 003', 'Gang Tulip No. 6');
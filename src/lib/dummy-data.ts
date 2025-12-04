// Dummy data for UI development

export type Role = 'admin' | 'rw' | 'rt' | 'penduduk';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  rw_id?: string;
  rt_id?: string;
}

export interface RW {
  id: string;
  nama_rw: string;
  ketua: string;
  jumlah_rt: number;
  jumlah_penduduk: number;
}

export interface RT {
  id: string;
  rw_id: string;
  nama_rt: string;
  ketua: string;
  jumlah_penduduk: number;
}

export interface Penduduk {
  id: string;
  rt_id: string;
  user_id: string | null;
  nama: string;
  nik: string;
  alamat: string;
  no_hp: string;
  jenis_kelamin: 'L' | 'P';
  tanggal_lahir: string;
  punya_akun: boolean;
}

export interface Surat {
  id: string;
  penduduk_id: string;
  penduduk_nama: string;
  jenis: 'domisili' | 'pengantar' | 'keterangan' | 'tidak_mampu';
  status: 'menunggu' | 'diproses' | 'disetujui' | 'ditolak';
  tanggal: string;
  keterangan?: string;
}

export interface Laporan {
  id: string;
  penduduk_id: string;
  penduduk_nama: string;
  judul: string;
  isi: string;
  status: 'baru' | 'diproses' | 'selesai';
  tanggal: string;
  kategori: 'infrastruktur' | 'keamanan' | 'kebersihan' | 'lainnya';
}

export interface Pengumuman {
  id: string;
  judul: string;
  isi: string;
  role_target: 'semua' | 'rw' | 'rt' | 'penduduk';
  tanggal: string;
  pembuat: string;
}

// Dummy Data
export const dummyRW: RW[] = [
  { id: 'rw1', nama_rw: 'RW 001', ketua: 'H. Ahmad Sudirman', jumlah_rt: 5, jumlah_penduduk: 450 },
  { id: 'rw2', nama_rw: 'RW 002', ketua: 'Drs. Bambang Sutrisno', jumlah_rt: 4, jumlah_penduduk: 380 },
  { id: 'rw3', nama_rw: 'RW 003', ketua: 'Ir. Cahyono Wibowo', jumlah_rt: 6, jumlah_penduduk: 520 },
];

export const dummyRT: RT[] = [
  { id: 'rt1', rw_id: 'rw1', nama_rt: 'RT 001', ketua: 'Budi Santoso', jumlah_penduduk: 90 },
  { id: 'rt2', rw_id: 'rw1', nama_rt: 'RT 002', ketua: 'Deni Wijaya', jumlah_penduduk: 85 },
  { id: 'rt3', rw_id: 'rw1', nama_rt: 'RT 003', ketua: 'Eko Prasetyo', jumlah_penduduk: 92 },
  { id: 'rt4', rw_id: 'rw1', nama_rt: 'RT 004', ketua: 'Faisal Rahman', jumlah_penduduk: 88 },
  { id: 'rt5', rw_id: 'rw1', nama_rt: 'RT 005', ketua: 'Gunawan Hidayat', jumlah_penduduk: 95 },
  { id: 'rt6', rw_id: 'rw2', nama_rt: 'RT 001', ketua: 'Hendra Kusuma', jumlah_penduduk: 95 },
  { id: 'rt7', rw_id: 'rw2', nama_rt: 'RT 002', ketua: 'Irwan Setiawan', jumlah_penduduk: 98 },
  { id: 'rt8', rw_id: 'rw2', nama_rt: 'RT 003', ketua: 'Joko Widodo', jumlah_penduduk: 92 },
  { id: 'rt9', rw_id: 'rw2', nama_rt: 'RT 004', ketua: 'Kurniawan Hadi', jumlah_penduduk: 95 },
];

export const dummyPenduduk: Penduduk[] = [
  { id: 'p1', rt_id: 'rt1', user_id: 'u1', nama: 'Agus Hermawan', nik: '3201010101010001', alamat: 'Jl. Melati No. 1', no_hp: '081234567890', jenis_kelamin: 'L', tanggal_lahir: '1985-05-15', punya_akun: true },
  { id: 'p2', rt_id: 'rt1', user_id: null, nama: 'Siti Rahayu', nik: '3201010101010002', alamat: 'Jl. Melati No. 2', no_hp: '081234567891', jenis_kelamin: 'P', tanggal_lahir: '1990-08-20', punya_akun: false },
  { id: 'p3', rt_id: 'rt1', user_id: 'u2', nama: 'Bambang Supriadi', nik: '3201010101010003', alamat: 'Jl. Melati No. 3', no_hp: '081234567892', jenis_kelamin: 'L', tanggal_lahir: '1978-12-10', punya_akun: true },
  { id: 'p4', rt_id: 'rt1', user_id: null, nama: 'Dewi Lestari', nik: '3201010101010004', alamat: 'Jl. Mawar No. 1', no_hp: '081234567893', jenis_kelamin: 'P', tanggal_lahir: '1995-03-25', punya_akun: false },
  { id: 'p5', rt_id: 'rt2', user_id: null, nama: 'Eko Purnomo', nik: '3201010101010005', alamat: 'Jl. Dahlia No. 5', no_hp: '081234567894', jenis_kelamin: 'L', tanggal_lahir: '1982-07-30', punya_akun: false },
  { id: 'p6', rt_id: 'rt2', user_id: 'u3', nama: 'Fitri Handayani', nik: '3201010101010006', alamat: 'Jl. Dahlia No. 6', no_hp: '081234567895', jenis_kelamin: 'P', tanggal_lahir: '1988-11-05', punya_akun: true },
];

export const dummySurat: Surat[] = [
  { id: 's1', penduduk_id: 'p1', penduduk_nama: 'Agus Hermawan', jenis: 'domisili', status: 'menunggu', tanggal: '2024-01-15' },
  { id: 's2', penduduk_id: 'p3', penduduk_nama: 'Bambang Supriadi', jenis: 'pengantar', status: 'disetujui', tanggal: '2024-01-14' },
  { id: 's3', penduduk_id: 'p6', penduduk_nama: 'Fitri Handayani', jenis: 'keterangan', status: 'diproses', tanggal: '2024-01-13' },
  { id: 's4', penduduk_id: 'p1', penduduk_nama: 'Agus Hermawan', jenis: 'tidak_mampu', status: 'ditolak', tanggal: '2024-01-10', keterangan: 'Data tidak lengkap' },
];

export const dummyLaporan: Laporan[] = [
  { id: 'l1', penduduk_id: 'p1', penduduk_nama: 'Agus Hermawan', judul: 'Jalan Rusak', isi: 'Jalan di depan rumah berlubang besar', status: 'baru', tanggal: '2024-01-15', kategori: 'infrastruktur' },
  { id: 'l2', penduduk_id: 'p3', penduduk_nama: 'Bambang Supriadi', judul: 'Lampu Jalan Mati', isi: 'Lampu jalan di gang 3 sudah mati 1 minggu', status: 'diproses', tanggal: '2024-01-14', kategori: 'infrastruktur' },
  { id: 'l3', penduduk_id: 'p6', penduduk_nama: 'Fitri Handayani', judul: 'Sampah Menumpuk', isi: 'Sampah di TPS sudah penuh dan berbau', status: 'selesai', tanggal: '2024-01-12', kategori: 'kebersihan' },
];

export const dummyPengumuman: Pengumuman[] = [
  { id: 'pg1', judul: 'Jadwal Posyandu Bulan Ini', isi: 'Posyandu akan dilaksanakan pada tanggal 20 Januari 2024 pukul 09:00 WIB di Balai RT.', role_target: 'semua', tanggal: '2024-01-10', pembuat: 'RT 001' },
  { id: 'pg2', judul: 'Rapat Koordinasi RW', isi: 'Mengundang seluruh Ketua RT untuk hadir pada rapat koordinasi tanggal 25 Januari 2024.', role_target: 'rt', tanggal: '2024-01-08', pembuat: 'RW 001' },
  { id: 'pg3', judul: 'Iuran Bulanan', isi: 'Mohon untuk segera melunasi iuran bulanan maksimal tanggal 15 setiap bulannya.', role_target: 'penduduk', tanggal: '2024-01-05', pembuat: 'RT 001' },
];

export const dummyUsers: User[] = [
  { id: 'admin1', email: 'admin@desa.go.id', role: 'admin', name: 'Administrator' },
  { id: 'rw1-user', email: 'rw001@desa.go.id', role: 'rw', name: 'H. Ahmad Sudirman', rw_id: 'rw1' },
  { id: 'rt1-user', email: 'rt001@desa.go.id', role: 'rt', name: 'Budi Santoso', rw_id: 'rw1', rt_id: 'rt1' },
  { id: 'u1', email: 'agus@email.com', role: 'penduduk', name: 'Agus Hermawan', rw_id: 'rw1', rt_id: 'rt1' },
];

// Helper functions
export const getJenisSuratLabel = (jenis: Surat['jenis']): string => {
  const labels: Record<Surat['jenis'], string> = {
    domisili: 'Surat Keterangan Domisili',
    pengantar: 'Surat Pengantar',
    keterangan: 'Surat Keterangan',
    tidak_mampu: 'Surat Keterangan Tidak Mampu',
  };
  return labels[jenis];
};

export const getStatusSuratColor = (status: Surat['status']): string => {
  const colors: Record<Surat['status'], string> = {
    menunggu: 'bg-warning/10 text-warning',
    diproses: 'bg-primary/10 text-primary',
    disetujui: 'bg-success/10 text-success',
    ditolak: 'bg-destructive/10 text-destructive',
  };
  return colors[status];
};

export const getStatusLaporanColor = (status: Laporan['status']): string => {
  const colors: Record<Laporan['status'], string> = {
    baru: 'bg-warning/10 text-warning',
    diproses: 'bg-primary/10 text-primary',
    selesai: 'bg-success/10 text-success',
  };
  return colors[status];
};

export const getKategoriLaporanLabel = (kategori: Laporan['kategori']): string => {
  const labels: Record<Laporan['kategori'], string> = {
    infrastruktur: 'Infrastruktur',
    keamanan: 'Keamanan',
    kebersihan: 'Kebersihan',
    lainnya: 'Lainnya',
  };
  return labels[kategori];
};

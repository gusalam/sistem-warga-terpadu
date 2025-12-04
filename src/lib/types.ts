// Database types for the application

export type AppRole = 'admin' | 'rw' | 'rt' | 'penduduk';

export interface RW {
  id: string;
  nomor: string;
  nama: string;
  ketua_id: string | null;
  alamat: string | null;
  created_at: string;
  updated_at: string;
}

export interface RT {
  id: string;
  rw_id: string;
  nomor: string;
  nama: string;
  ketua_id: string | null;
  alamat: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  rw?: RW;
}

export interface Profile {
  id: string;
  nama: string;
  nik: string | null;
  email: string | null;
  phone: string | null;
  alamat: string | null;
  rt_id: string | null;
  rw_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Penduduk {
  id: string;
  user_id: string | null;
  nik: string;
  nama: string;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  jenis_kelamin: string | null;
  agama: string | null;
  status_perkawinan: string | null;
  pekerjaan: string | null;
  alamat: string | null;
  rt_id: string;
  no_kk: string | null;
  status_kependudukan: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  rt?: RT;
}

export type SuratStatus = 'pending' | 'diproses' | 'selesai' | 'ditolak';

export interface Surat {
  id: string;
  nomor_surat: string | null;
  jenis_surat: string;
  penduduk_id: string;
  rt_id: string;
  keperluan: string | null;
  status: SuratStatus;
  catatan: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  penduduk?: Penduduk;
  rt?: RT;
}

export type LaporanStatus = 'pending' | 'diproses' | 'ditindaklanjuti' | 'selesai' | 'ditolak';
export type LaporanPrioritas = 'rendah' | 'normal' | 'tinggi' | 'urgent';

export interface Laporan {
  id: string;
  judul: string;
  deskripsi: string;
  kategori: string | null;
  penduduk_id: string;
  rt_id: string;
  status: LaporanStatus;
  prioritas: LaporanPrioritas;
  tanggapan: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  penduduk?: Penduduk;
  rt?: RT;
}

export interface Pengumuman {
  id: string;
  judul: string;
  isi: string;
  target_audience: AppRole[] | null;
  rw_id: string | null;
  rt_id: string | null;
  is_pinned: boolean;
  author_id: string;
  published_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  author?: Profile;
  rw?: RW;
  rt?: RT;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

// Helper types for forms
export interface CreateRWInput {
  nomor: string;
  nama: string;
  alamat?: string;
}

export interface CreateRTInput {
  rw_id: string;
  nomor: string;
  nama: string;
  alamat?: string;
}

export interface CreatePendudukInput {
  nik: string;
  nama: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  agama?: string;
  status_perkawinan?: string;
  pekerjaan?: string;
  alamat?: string;
  rt_id: string;
  no_kk?: string;
  status_kependudukan?: string;
  phone?: string;
}

export interface CreateSuratInput {
  jenis_surat: string;
  penduduk_id: string;
  rt_id: string;
  keperluan?: string;
}

export interface CreateLaporanInput {
  judul: string;
  deskripsi: string;
  kategori?: string;
  penduduk_id: string;
  rt_id: string;
  prioritas?: LaporanPrioritas;
}

export interface CreatePengumumanInput {
  judul: string;
  isi: string;
  target_audience?: AppRole[];
  rw_id?: string;
  rt_id?: string;
  is_pinned?: boolean;
  expires_at?: string;
}

// Status helpers
export const SURAT_STATUS_LABELS: Record<SuratStatus, string> = {
  pending: 'Menunggu',
  diproses: 'Diproses',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
};

export const LAPORAN_STATUS_LABELS: Record<LaporanStatus, string> = {
  pending: 'Pending',
  diproses: 'Diproses',
  ditindaklanjuti: 'Ditindaklanjuti',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
};

export const LAPORAN_PRIORITAS_LABELS: Record<LaporanPrioritas, string> = {
  rendah: 'Rendah',
  normal: 'Normal',
  tinggi: 'Tinggi',
  urgent: 'Urgent',
};

export const JENIS_SURAT_OPTIONS = [
  { value: 'domisili', label: 'Surat Keterangan Domisili' },
  { value: 'pengantar', label: 'Surat Pengantar' },
  { value: 'keterangan', label: 'Surat Keterangan' },
  { value: 'tidak_mampu', label: 'Surat Keterangan Tidak Mampu' },
  { value: 'kelahiran', label: 'Surat Keterangan Kelahiran' },
  { value: 'kematian', label: 'Surat Keterangan Kematian' },
  { value: 'pindah', label: 'Surat Keterangan Pindah' },
  { value: 'usaha', label: 'Surat Keterangan Usaha' },
];

export const KATEGORI_LAPORAN_OPTIONS = [
  { value: 'infrastruktur', label: 'Infrastruktur' },
  { value: 'keamanan', label: 'Keamanan' },
  { value: 'kebersihan', label: 'Kebersihan' },
  { value: 'sosial', label: 'Sosial' },
  { value: 'lainnya', label: 'Lainnya' },
];

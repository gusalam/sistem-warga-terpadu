export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agenda: {
        Row: {
          created_at: string | null
          deskripsi: string | null
          id: string
          is_active: boolean | null
          judul: string
          lokasi: string | null
          tanggal: string
          updated_at: string | null
          waktu: string | null
        }
        Insert: {
          created_at?: string | null
          deskripsi?: string | null
          id?: string
          is_active?: boolean | null
          judul: string
          lokasi?: string | null
          tanggal: string
          updated_at?: string | null
          waktu?: string | null
        }
        Update: {
          created_at?: string | null
          deskripsi?: string | null
          id?: string
          is_active?: boolean | null
          judul?: string
          lokasi?: string | null
          tanggal?: string
          updated_at?: string | null
          waktu?: string | null
        }
        Relationships: []
      }
      banner: {
        Row: {
          created_at: string | null
          deskripsi: string | null
          gambar_url: string
          id: string
          is_active: boolean | null
          judul: string
          link_url: string | null
          updated_at: string | null
          urutan: number | null
        }
        Insert: {
          created_at?: string | null
          deskripsi?: string | null
          gambar_url: string
          id?: string
          is_active?: boolean | null
          judul: string
          link_url?: string | null
          updated_at?: string | null
          urutan?: number | null
        }
        Update: {
          created_at?: string | null
          deskripsi?: string | null
          gambar_url?: string
          id?: string
          is_active?: boolean | null
          judul?: string
          link_url?: string | null
          updated_at?: string | null
          urutan?: number | null
        }
        Relationships: []
      }
      berita: {
        Row: {
          author_id: string
          created_at: string | null
          gambar_url: string | null
          id: string
          is_published: boolean | null
          judul: string
          konten: string
          published_at: string | null
          ringkasan: string | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          created_at?: string | null
          gambar_url?: string | null
          id?: string
          is_published?: boolean | null
          judul: string
          konten: string
          published_at?: string | null
          ringkasan?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          created_at?: string | null
          gambar_url?: string | null
          id?: string
          is_published?: boolean | null
          judul?: string
          konten?: string
          published_at?: string | null
          ringkasan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      laporan: {
        Row: {
          created_at: string | null
          deskripsi: string
          id: string
          judul: string
          kategori: string | null
          penduduk_id: string
          prioritas: string | null
          processed_at: string | null
          processed_by: string | null
          rt_id: string
          status: string | null
          tanggapan: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deskripsi: string
          id?: string
          judul: string
          kategori?: string | null
          penduduk_id: string
          prioritas?: string | null
          processed_at?: string | null
          processed_by?: string | null
          rt_id: string
          status?: string | null
          tanggapan?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deskripsi?: string
          id?: string
          judul?: string
          kategori?: string | null
          penduduk_id?: string
          prioritas?: string | null
          processed_at?: string | null
          processed_by?: string | null
          rt_id?: string
          status?: string | null
          tanggapan?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "laporan_penduduk_id_fkey"
            columns: ["penduduk_id"]
            isOneToOne: false
            referencedRelation: "penduduk"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "laporan_rt_id_fkey"
            columns: ["rt_id"]
            isOneToOne: false
            referencedRelation: "rt"
            referencedColumns: ["id"]
          },
        ]
      }
      penduduk: {
        Row: {
          agama: string | null
          alamat: string | null
          created_at: string | null
          id: string
          jenis_kelamin: string | null
          nama: string
          nik: string
          no_kk: string | null
          pekerjaan: string | null
          phone: string | null
          rt_id: string
          status_kependudukan: string | null
          status_perkawinan: string | null
          tanggal_lahir: string | null
          tempat_lahir: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agama?: string | null
          alamat?: string | null
          created_at?: string | null
          id?: string
          jenis_kelamin?: string | null
          nama: string
          nik: string
          no_kk?: string | null
          pekerjaan?: string | null
          phone?: string | null
          rt_id: string
          status_kependudukan?: string | null
          status_perkawinan?: string | null
          tanggal_lahir?: string | null
          tempat_lahir?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agama?: string | null
          alamat?: string | null
          created_at?: string | null
          id?: string
          jenis_kelamin?: string | null
          nama?: string
          nik?: string
          no_kk?: string | null
          pekerjaan?: string | null
          phone?: string | null
          rt_id?: string
          status_kependudukan?: string | null
          status_perkawinan?: string | null
          tanggal_lahir?: string | null
          tempat_lahir?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "penduduk_rt_id_fkey"
            columns: ["rt_id"]
            isOneToOne: false
            referencedRelation: "rt"
            referencedColumns: ["id"]
          },
        ]
      }
      pengumuman: {
        Row: {
          author_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_pinned: boolean | null
          isi: string
          judul: string
          published_at: string | null
          rt_id: string | null
          rw_id: string | null
          target_audience: Database["public"]["Enums"]["app_role"][] | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_pinned?: boolean | null
          isi: string
          judul: string
          published_at?: string | null
          rt_id?: string | null
          rw_id?: string | null
          target_audience?: Database["public"]["Enums"]["app_role"][] | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_pinned?: boolean | null
          isi?: string
          judul?: string
          published_at?: string | null
          rt_id?: string | null
          rw_id?: string | null
          target_audience?: Database["public"]["Enums"]["app_role"][] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pengumuman_rt_id_fkey"
            columns: ["rt_id"]
            isOneToOne: false
            referencedRelation: "rt"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pengumuman_rw_id_fkey"
            columns: ["rw_id"]
            isOneToOne: false
            referencedRelation: "rw"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          alamat: string | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          nama: string
          nik: string | null
          phone: string | null
          rt_id: string | null
          rw_id: string | null
          updated_at: string | null
        }
        Insert: {
          alamat?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          nama: string
          nik?: string | null
          phone?: string | null
          rt_id?: string | null
          rw_id?: string | null
          updated_at?: string | null
        }
        Update: {
          alamat?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nama?: string
          nik?: string | null
          phone?: string | null
          rt_id?: string | null
          rw_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_rt_id_fkey"
            columns: ["rt_id"]
            isOneToOne: false
            referencedRelation: "rt"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_rw_id_fkey"
            columns: ["rw_id"]
            isOneToOne: false
            referencedRelation: "rw"
            referencedColumns: ["id"]
          },
        ]
      }
      rt: {
        Row: {
          alamat: string | null
          created_at: string | null
          id: string
          ketua_id: string | null
          nama: string
          nomor: string
          rw_id: string
          updated_at: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string | null
          id?: string
          ketua_id?: string | null
          nama: string
          nomor: string
          rw_id: string
          updated_at?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string | null
          id?: string
          ketua_id?: string | null
          nama?: string
          nomor?: string
          rw_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rt_rw_id_fkey"
            columns: ["rw_id"]
            isOneToOne: false
            referencedRelation: "rw"
            referencedColumns: ["id"]
          },
        ]
      }
      rw: {
        Row: {
          alamat: string | null
          created_at: string | null
          id: string
          ketua_id: string | null
          nama: string
          nomor: string
          updated_at: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string | null
          id?: string
          ketua_id?: string | null
          nama: string
          nomor: string
          updated_at?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string | null
          id?: string
          ketua_id?: string | null
          nama?: string
          nomor?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      surat: {
        Row: {
          catatan: string | null
          created_at: string | null
          id: string
          jenis_surat: string
          keperluan: string | null
          nomor_surat: string | null
          penduduk_id: string
          processed_at: string | null
          processed_by: string | null
          rt_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          catatan?: string | null
          created_at?: string | null
          id?: string
          jenis_surat: string
          keperluan?: string | null
          nomor_surat?: string | null
          penduduk_id: string
          processed_at?: string | null
          processed_by?: string | null
          rt_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          catatan?: string | null
          created_at?: string | null
          id?: string
          jenis_surat?: string
          keperluan?: string | null
          nomor_surat?: string | null
          penduduk_id?: string
          processed_at?: string | null
          processed_by?: string | null
          rt_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surat_penduduk_id_fkey"
            columns: ["penduduk_id"]
            isOneToOne: false
            referencedRelation: "penduduk"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surat_rt_id_fkey"
            columns: ["rt_id"]
            isOneToOne: false
            referencedRelation: "rt"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_rw_from_rt: { Args: { _rt_id: string }; Returns: string }
      get_user_rt_id: { Args: { _user_id: string }; Returns: string }
      get_user_rw_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_rt_ketua: {
        Args: { _rt_id: string; _user_id: string }
        Returns: boolean
      }
      is_rw_ketua: {
        Args: { _rw_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "rw" | "rt" | "penduduk"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "rw", "rt", "penduduk"],
    },
  },
} as const

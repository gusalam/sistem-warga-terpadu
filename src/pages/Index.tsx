import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, Users, FileText, Shield, ArrowRight } from 'lucide-react';

const Index: React.FC = () => {
  const features = [
    {
      icon: Users,
      title: 'Manajemen Penduduk',
      description: 'Kelola data penduduk dengan mudah dan terstruktur',
    },
    {
      icon: FileText,
      title: 'Layanan Surat',
      description: 'Pengajuan surat online cepat dan efisien',
    },
    {
      icon: Shield,
      title: 'Keamanan Data',
      description: 'Data tersimpan aman dengan akses terkontrol',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <div className="container mx-auto px-4 py-8">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Building2 className="text-primary-foreground" size={24} />
              </div>
              <span className="text-xl font-bold">SiWarga</span>
            </div>
            <Link to="/login">
              <Button>
                Masuk
                <ArrowRight size={18} />
              </Button>
            </Link>
          </nav>

          <div className="text-center max-w-3xl mx-auto py-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              Sistem Informasi
              <span className="text-primary block mt-2">Warga RT/RW</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-slide-up">
              Platform digital untuk mempermudah pengelolaan administrasi 
              dan layanan warga di lingkungan RT/RW
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Mulai Sekarang
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Pelajari Lebih Lanjut
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Fitur Utama</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card p-8 rounded-xl border border-border hover:shadow-lg transition-shadow animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6">
                  <feature.icon className="text-primary-foreground" size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="gradient-primary rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              Siap untuk memulai?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Masuk ke sistem untuk mengakses layanan administrasi RT/RW secara online
            </p>
            <Link to="/login">
              <Button size="lg" variant="secondary">
                Masuk ke Dashboard
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 SiWarga - Sistem Informasi Warga RT/RW</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

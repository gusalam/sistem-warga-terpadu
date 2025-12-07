import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, Users, FileText, Shield, ArrowRight, Sparkles, Globe, Zap } from 'lucide-react';

const Index: React.FC = () => {
  const features = [
    {
      icon: Users,
      title: 'Manajemen Penduduk',
      description: 'Kelola data penduduk dengan mudah dan terstruktur',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FileText,
      title: 'Layanan Surat',
      description: 'Pengajuan surat online cepat dan efisien',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Shield,
      title: 'Keamanan Data',
      description: 'Data tersimpan aman dengan akses terkontrol',
      color: 'from-violet-500 to-purple-500',
    },
  ];

  const stats = [
    { value: '1000+', label: 'Penduduk Terdaftar' },
    { value: '500+', label: 'Surat Diproses' },
    { value: '50+', label: 'RT/RW Aktif' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float-reverse" />
      </div>

      {/* Hero Section */}
      <header className="relative">
        <div className="container mx-auto px-4 py-6">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-12 animate-fade-in">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-110">
                <Building2 className="text-primary-foreground" size={24} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                SiWarga
              </span>
            </div>
            <Link to="/login">
              <Button className="shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5">
                Masuk
                <ArrowRight size={18} className="ml-1" />
              </Button>
            </Link>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto py-16 md:py-24 relative">
            {/* Floating decorative elements */}
            <div className="absolute -top-10 left-1/4 opacity-0 animate-fade-in stagger-2">
              <Sparkles className="text-primary/40 animate-pulse-glow" size={32} />
            </div>
            <div className="absolute top-20 right-1/4 opacity-0 animate-fade-in stagger-3">
              <Globe className="text-accent-foreground/30 animate-float-slow" size={28} />
            </div>
            <div className="absolute bottom-10 left-1/3 opacity-0 animate-fade-in stagger-4">
              <Zap className="text-warning/40 animate-bounce-subtle" size={24} />
            </div>

            <div className="opacity-0 animate-slide-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles size={16} />
                Platform Digital Terpercaya
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 opacity-0 animate-slide-up stagger-1">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Sistem Informasi
              </span>
              <span className="block mt-2 bg-gradient-to-r from-primary via-primary to-accent-foreground bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">
                Warga RT/RW
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto opacity-0 animate-slide-up stagger-2">
              Platform digital modern untuk mempermudah pengelolaan administrasi 
              dan layanan warga di lingkungan RT/RW Anda
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-slide-up stagger-3">
              <Link to="/login">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto text-base px-8 shadow-xl shadow-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 group"
                >
                  Mulai Sekarang
                  <ArrowRight size={20} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto text-base px-8 border-2 transition-all duration-300 hover:bg-accent hover:-translate-y-1"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Pelajari Lebih Lanjut
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 mt-16 md:mt-20 opacity-0 animate-fade-in stagger-4">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 transition-all duration-300 hover:bg-card hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16 opacity-0 animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Fitur Unggulan
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Solusi Lengkap untuk
              <span className="text-primary"> Warga</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-card p-8 rounded-2xl border border-border/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/30 opacity-0 animate-slide-up"
                style={{ animationDelay: `${0.2 + index * 0.15}s`, animationFillMode: 'forwards' }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <feature.icon className="text-white" size={28} />
                </div>
                <h3 className="relative text-xl font-semibold mb-3 transition-colors duration-300 group-hover:text-primary">
                  {feature.title}
                </h3>
                <p className="relative text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div 
            className="relative overflow-hidden rounded-3xl p-8 md:p-16 text-center opacity-0 animate-scale-in"
            style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-accent-foreground animate-gradient-shift bg-[length:200%_auto]" />
            
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-float" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/5 rounded-full blur-3xl animate-float-slow" />
            
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 md:mb-6">
                Siap untuk memulai?
              </h2>
              <p className="text-primary-foreground/80 mb-8 md:mb-10 max-w-xl mx-auto text-base md:text-lg">
                Masuk ke sistem untuk mengakses layanan administrasi RT/RW secara online dengan mudah dan cepat
              </p>
              <Link to="/login">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="text-base px-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group"
                >
                  Masuk ke Dashboard
                  <ArrowRight size={20} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50 relative">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Building2 className="text-primary-foreground" size={16} />
            </div>
            <span className="font-semibold">SiWarga</span>
          </div>
          <p className="text-muted-foreground text-sm">
            &copy; 2024 SiWarga - Sistem Informasi Warga RT/RW
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

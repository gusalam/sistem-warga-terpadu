import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Banner } from '@/hooks/useHomeData';
import { Skeleton } from '@/components/ui/skeleton';

interface HeroBannerProps {
  banners: Banner[];
  isLoading: boolean;
}

const HeroBanner = ({ banners, isLoading }: HeroBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (isLoading) {
    return (
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-gradient-to-br from-header to-header-accent flex items-center justify-center">
        <div className="text-center text-header-foreground p-6">
          <h2 className="text-2xl md:text-4xl font-bold mb-2">Selamat Datang di RW 10</h2>
          <p className="text-header-foreground/80">Kelurahan yang Ramah & Harmonis</p>
        </div>
      </div>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden group">
      {/* Image */}
      <img
        src={currentBanner.gambar_url}
        alt={currentBanner.judul}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-white text-xl md:text-3xl font-bold mb-2 animate-fade-in">
            {currentBanner.judul}
          </h2>
          {currentBanner.deskripsi && (
            <p className="text-white/90 text-sm md:text-base mb-4 line-clamp-2 max-w-2xl">
              {currentBanner.deskripsi}
            </p>
          )}
          {currentBanner.link_url && (
            <Button 
              size="sm"
              className="bg-cta hover:bg-cta-hover text-cta-foreground rounded-full px-6"
              onClick={() => window.open(currentBanner.link_url!, '_blank')}
            >
              Baca Selengkapnya
            </Button>
          )}
        </div>
      </div>
      
      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}
      
      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;

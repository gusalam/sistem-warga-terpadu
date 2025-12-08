import { ChevronRight, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Berita } from '@/hooks/useHomeData';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface BeritaTerkiniProps {
  berita: Berita[];
  isLoading: boolean;
}

const BeritaTerkini = ({ berita, isLoading }: BeritaTerkiniProps) => {
  if (isLoading) {
    return (
      <section className="px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-7 w-40 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-cta" />
            Berita Terkini
          </h2>
          <Button variant="ghost" size="sm" className="text-cta hover:text-cta-hover">
            Lihat Semua
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {berita.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Newspaper className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Belum ada berita terbaru</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {berita.map((item, index) => (
              <Card
                key={item.id}
                className={`
                  group cursor-pointer overflow-hidden border-0 shadow-sm hover:shadow-md
                  transition-all duration-300 hover:-translate-y-0.5
                  animate-slide-up opacity-0
                `}
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              >
                <CardContent className="p-0">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-24 h-24 md:w-32 md:h-28 flex-shrink-0 overflow-hidden rounded-l-xl">
                      {item.gambar_url ? (
                        <img
                          src={item.gambar_url}
                          alt={item.judul}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-header to-header-accent flex items-center justify-center">
                          <Newspaper className="h-8 w-8 text-white/50" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 py-3 pr-4">
                      <h3 className="font-medium text-foreground line-clamp-2 mb-1 group-hover:text-cta transition-colors">
                        {item.judul}
                      </h3>
                      {item.ringkasan && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                          {item.ringkasan}
                        </p>
                      )}
                      {item.published_at && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(item.published_at), 'd MMM yyyy', { locale: id })}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BeritaTerkini;

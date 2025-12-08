import { CalendarDays, MapPin, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Agenda } from '@/hooks/useHomeData';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface AgendaKegiatanProps {
  agenda: Agenda[];
  isLoading: boolean;
}

const AgendaKegiatan = ({ agenda, isLoading }: AgendaKegiatanProps) => {
  if (isLoading) {
    return (
      <section className="px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-7 w-40 mb-4" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-cta" />
            Agenda Kegiatan
          </h2>
          <Button variant="ghost" size="sm" className="text-cta hover:text-cta-hover">
            Lihat Semua
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {agenda.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Belum ada agenda mendatang</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {agenda.map((item, index) => {
              const tanggal = new Date(item.tanggal);
              
              return (
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
                      {/* Date Badge */}
                      <div className="w-20 md:w-24 flex-shrink-0 bg-gradient-to-br from-cta to-cta-hover text-cta-foreground flex flex-col items-center justify-center py-4 rounded-l-xl">
                        <span className="text-2xl md:text-3xl font-bold">
                          {format(tanggal, 'd')}
                        </span>
                        <span className="text-xs uppercase tracking-wide opacity-90">
                          {format(tanggal, 'MMM', { locale: id })}
                        </span>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 py-3 pr-4">
                        <h3 className="font-medium text-foreground mb-2 group-hover:text-cta transition-colors">
                          {item.judul}
                        </h3>
                        
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          {item.waktu && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {item.waktu.slice(0, 5)}
                            </span>
                          )}
                          {item.lokasi && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {item.lokasi}
                            </span>
                          )}
                        </div>
                        
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto mt-2 text-cta hover:text-cta-hover"
                        >
                          Detail Agenda
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default AgendaKegiatan;

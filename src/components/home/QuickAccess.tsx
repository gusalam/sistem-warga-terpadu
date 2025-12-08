import { Heart, FileText, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const quickAccessItems = [
  {
    id: 'rukun-kematian',
    label: 'Rukun Kematian',
    icon: Heart,
    color: 'from-rose-500 to-pink-600',
    path: '/pengumuman',
  },
  {
    id: 'urus-surat',
    label: 'Urus Surat',
    icon: FileText,
    color: 'from-header to-blue-700',
    path: '/surat',
  },
  {
    id: 'jadwal-ronda',
    label: 'Jadwal Ronda',
    icon: Calendar,
    color: 'from-emerald-500 to-green-600',
    path: '/pengumuman',
  },
];

const QuickAccess = () => {
  const navigate = useNavigate();

  return (
    <section className="px-4 py-6 -mt-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-lg font-semibold text-foreground mb-4">Akses Cepat</h2>
        
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {quickAccessItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`
                group relative overflow-hidden rounded-2xl p-4 md:p-6
                bg-gradient-to-br ${item.color}
                shadow-lg hover:shadow-xl
                transform transition-all duration-300
                hover:scale-105 hover:-translate-y-1
                focus:outline-none focus:ring-2 focus:ring-cta focus:ring-offset-2
                animate-slide-up opacity-0
                min-h-[100px] md:min-h-[120px]
              `}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
              
              <div className="relative flex flex-col items-center justify-center gap-2 text-white">
                <item.icon className="h-8 w-8 md:h-10 md:w-10 drop-shadow-md" />
                <span className="text-xs md:text-sm font-medium text-center leading-tight">
                  {item.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickAccess;

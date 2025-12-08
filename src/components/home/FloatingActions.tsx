import { MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const FloatingActions = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-6 left-4 right-4 z-40 pointer-events-none">
      <div className="max-w-7xl mx-auto flex justify-center gap-4 pointer-events-auto">
        <Button
          onClick={() => navigate('/laporan')}
          className="
            flex-1 max-w-[200px] h-14 rounded-full
            bg-cta hover:bg-cta-hover text-cta-foreground
            shadow-lg hover:shadow-xl
            transition-all duration-300 hover:scale-105
            font-medium text-sm md:text-base
          "
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Lapor/Aspirasi
        </Button>
        
        <Button
          onClick={() => window.open('tel:+628123456789')}
          className="
            flex-1 max-w-[200px] h-14 rounded-full
            bg-cta hover:bg-cta-hover text-cta-foreground
            shadow-lg hover:shadow-xl
            transition-all duration-300 hover:scale-105
            font-medium text-sm md:text-base
          "
        >
          <Phone className="h-5 w-5 mr-2" />
          Hubungi RT
        </Button>
      </div>
    </div>
  );
};

export default FloatingActions;

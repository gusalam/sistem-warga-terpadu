import { Menu, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const HomeHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-header text-header-foreground py-3 px-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-header-foreground hover:bg-header-accent">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-header text-header-foreground border-header-accent">
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/" className="px-4 py-3 rounded-lg hover:bg-header-accent transition-colors">
                  Beranda
                </Link>
                <Link to="/pengumuman" className="px-4 py-3 rounded-lg hover:bg-header-accent transition-colors">
                  Pengumuman
                </Link>
                {user ? (
                  <Link to="/dashboard" className="px-4 py-3 rounded-lg hover:bg-header-accent transition-colors">
                    Dashboard
                  </Link>
                ) : (
                  <Link to="/login" className="px-4 py-3 rounded-lg hover:bg-header-accent transition-colors">
                    Masuk
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          
          <h1 className="text-xl font-bold tracking-wide">RW 10</h1>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-header-foreground hover:bg-header-accent"
            onClick={() => navigate(user ? '/profil' : '/login')}
          >
            <User className="h-6 w-6" />
            <span className="sr-only">Profil</span>
          </Button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="bg-header/95 backdrop-blur-sm px-4 py-3">
        <div className="max-w-7xl mx-auto relative">
          <Input
            type="search"
            placeholder="Cari informasi..."
            className="w-full bg-card text-foreground pl-4 pr-12 py-3 h-12 rounded-xl border-0 shadow-md focus-visible:ring-2 focus-visible:ring-cta"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;

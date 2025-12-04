import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RWManagement from "./pages/RWManagement";
import RTManagement from "./pages/RTManagement";
import PendudukManagement from "./pages/PendudukManagement";
import SuratManagement from "./pages/SuratManagement";
import LaporanManagement from "./pages/LaporanManagement";
import PengumumanPage from "./pages/PengumumanPage";
import ProfilPage from "./pages/ProfilPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/rw" element={<RWManagement />} />
              <Route path="/rt" element={<RTManagement />} />
              <Route path="/penduduk" element={<PendudukManagement />} />
              <Route path="/surat" element={<SuratManagement />} />
              <Route path="/laporan" element={<LaporanManagement />} />
              <Route path="/pengumuman" element={<PengumumanPage />} />
              <Route path="/profil" element={<ProfilPage />} />
            </Route>
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

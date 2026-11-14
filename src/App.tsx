import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { CatalogPage } from './pages/CatalogPage';
import { ConsultoriaPage } from './pages/ConsultoriaPage';
import { HomePage } from './pages/HomePage';
import { VehicleDetailPage } from './pages/VehicleDetailPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-[#08090C]">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalogo" element={<CatalogPage />} />
            <Route path="/veiculo/:id" element={<VehicleDetailPage />} />
            <Route path="/consultoria" element={<ConsultoriaPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <FloatingWhatsApp />
      </div>
    </BrowserRouter>
  );
}

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, MessageCircle, X } from 'lucide-react';
import { BRAND_CONFIG, buildWhatsAppUrl } from '../config/brand';

const NAV_ITEMS = [
  { label: 'Início', to: '/' },
  { label: 'Veículos', to: '/catalogo' },
  { label: 'Consultoria', to: '/consultoria' },
  { label: 'Painel Admin', to: '/admin' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-black border-b border-zinc-800/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand mark */}
        <Link
          to="/"
          className="shrink-0 flex items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227]"
          aria-label={BRAND_CONFIG.fullTitle}
        >
          <img
            src={BRAND_CONFIG.logoPath}
            alt="AS Auto Dreams"
            className="h-12 sm:h-14 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </Link>

        {/* Zone 2: Single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-sm font-medium whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
                isActive(item.to)
                  ? 'text-[#E5C158] border-[#C9A227]'
                  : 'text-zinc-300 border-transparent hover:text-white hover:border-zinc-600'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={buildWhatsAppUrl('Olá! Gostaria de conversar com um consultor da AS Auto Dreams.')}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide text-black bg-gradient-to-r from-[#E5C158] to-[#C9A227] rounded-md hover:brightness-110 transition-all whitespace-nowrap shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Falar no WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 text-zinc-200 hover:text-white border border-zinc-800 rounded-md"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0B0C10] border-t border-zinc-800 px-4 py-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                isActive(item.to)
                  ? 'bg-zinc-900 text-[#E5C158]'
                  : 'text-zinc-200 hover:bg-zinc-900/70'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={buildWhatsAppUrl('Olá! Gostaria de conversar com um consultor da AS Auto Dreams.')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 mt-2 text-sm font-semibold text-black bg-gradient-to-r from-[#E5C158] to-[#C9A227] rounded-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Fale pelo WhatsApp</span>
          </a>
        </div>
      )}
    </header>
  );
}

import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '../config/brand';

export function FloatingWhatsApp() {
  const location = useLocation();

  // Não exibe botão flutuante dentro do painel administrativo
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <a
      href={buildWhatsAppUrl('Olá! Vim pelo site da AS Auto Dreams e gostaria de atendimento.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar pelo WhatsApp com a AS Auto Dreams"
      className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2.5 h-12 px-4 rounded-full bg-[#16A34A] text-white shadow-lg hover:bg-[#15803D] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]"
    >
      <MessageCircle className="w-5 h-5 shrink-0" />
      <span className="hidden sm:inline text-sm font-semibold whitespace-nowrap">WhatsApp</span>
    </a>
  );
}

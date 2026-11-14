import { Link } from 'react-router-dom';
import { Facebook, Instagram, MessageCircle, Phone } from 'lucide-react';
import { BRAND_CONFIG, buildWhatsAppUrl } from '../config/brand';

export function Footer() {
  return (
    <footer className="bg-black text-zinc-300 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Institucional & Logomarca */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="inline-block">
              <img
                src={BRAND_CONFIG.logoPath}
                alt="AS Auto Dreams Consultoria + Intermediação"
                className="h-20 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </Link>
            <div className="space-y-1">
              <p className="font-display text-base font-semibold text-white tracking-wide">
                {BRAND_CONFIG.companyName}
              </p>
              <p className="text-xs tracking-widest text-[#D4AF37]">
                {BRAND_CONFIG.companySubtitle}
              </p>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
              Divulgação, consultoria automotiva e intermediação de vendas com foco em procedência, transparência e segurança em cada negociação.
            </p>
            <div className="pt-2 border-t border-zinc-900">
              <p className="text-sm font-semibold text-white">{BRAND_CONFIG.ceoName}</p>
              <p className="text-xs text-zinc-400">{BRAND_CONFIG.ceoRole}</p>
            </div>
          </div>

          {/* Navegação */}
          <div className="md:col-span-3 space-y-3">
            <h2 className="font-display text-sm font-semibold text-white">Navegação</h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-zinc-400 hover:text-[#E5C158] transition-colors">
                  Página Inicial
                </Link>
              </li>
              <li>
                <Link to="/catalogo" className="text-zinc-400 hover:text-[#E5C158] transition-colors">
                  Catálogo de Veículos
                </Link>
              </li>
              <li>
                <Link to="/consultoria" className="text-zinc-400 hover:text-[#E5C158] transition-colors">
                  Consultoria e Intermediação
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-zinc-400 hover:text-[#E5C158] transition-colors">
                  Painel Administrativo
                </Link>
              </li>
            </ul>
          </div>

          {/* Contatos e Redes Sociais */}
          <div className="md:col-span-4 space-y-3">
            <h2 className="font-display text-sm font-semibold text-white">Atendimento e Redes Sociais</h2>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={buildWhatsAppUrl('Olá! Vim pelo site da AS Auto Dreams e gostaria de atendimento.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-zinc-300 hover:text-[#E5C158] transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span className="tabular-nums">WhatsApp: {BRAND_CONFIG.whatsappDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={BRAND_CONFIG.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-zinc-300 hover:text-[#E5C158] transition-colors"
                >
                  <Instagram className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Instagram: {BRAND_CONFIG.instagramHandle}</span>
                </a>
              </li>
              <li>
                <a
                  href={BRAND_CONFIG.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-zinc-300 hover:text-[#E5C158] transition-colors"
                >
                  <Facebook className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Facebook: {BRAND_CONFIG.facebookName}</span>
                </a>
              </li>
            </ul>

            <div className="pt-3">
              <a
                href={buildWhatsAppUrl('Olá! Gostaria de falar com Anderson Santana na AS Auto Dreams.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-black bg-gradient-to-r from-[#E5C158] to-[#C9A227] rounded-md hover:brightness-110 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Iniciar conversa no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-500">
          <p>
            © {new Date().getFullYear()} {BRAND_CONFIG.fullTitle}. Todos os direitos reservados.
          </p>
          <p>Tratamento de dados em conformidade com a LGPD (Lei nº 13.709/2018).</p>
        </div>
      </div>
    </footer>
  );
}

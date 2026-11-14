import { useEffect } from 'react';
import { Facebook, Instagram, MessageCircle, ShieldCheck } from 'lucide-react';
import { LeadInterestForm } from '../components/LeadInterestForm';
import { BRAND_CONFIG, buildWhatsAppUrl } from '../config/brand';

export function ConsultoriaPage() {
  useEffect(() => {
    document.title = 'Consultoria e Intermediação | AS Auto Dreams';
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F8F9] text-zinc-900">
      {/* Banner institucional */}
      <section className="bg-black text-white border-b border-zinc-800 py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-semibold tracking-widest text-[#D4AF37]">
              {BRAND_CONFIG.companyName} · {BRAND_CONFIG.companySubtitle}
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-white leading-tight [text-wrap:balance]">
              Consultoria especializada para compra, busca e intermediação de veículos.
            </h1>
            <p className="text-base text-zinc-300 leading-relaxed max-w-2xl">
              Conduzida por <strong className="text-white">{BRAND_CONFIG.ceoName}</strong> ({BRAND_CONFIG.ceoRole}), a AS Auto Dreams oferece atendimento individualizado para garantir negociações transparentes, seguras e alinhadas ao valor real de mercado.
            </p>
          </div>

          <div className="lg:col-span-5 flex justify-start lg:justify-end">
            <img
              src={BRAND_CONFIG.logoPath}
              alt="AS Auto Dreams"
              className="w-full max-w-[280px] h-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">
        {/* Pilares */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-2.5">
            <p className="text-xs font-mono text-[#9A7818]">01</p>
            <h2 className="font-display text-lg font-bold text-zinc-950">
              Consultoria de Compra
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Ajudamos você a definir o veículo certo para sua rotina, analisando histórico, procedência, manutenção e referência FIPE.
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-2.5">
            <p className="text-xs font-mono text-[#9A7818]">02</p>
            <h2 className="font-display text-lg font-bold text-zinc-950">
              Intermediação de Venda
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Divulgação qualificada, filtragem real de interessados e condução segura das propostas sem exposição desnecessária do proprietário.
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-2.5">
            <p className="text-xs font-mono text-[#9A7818]">03</p>
            <h2 className="font-display text-lg font-bold text-zinc-950">
              Transparência Documental
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Acompanhamento claro da documentação e conferência de dados para que comprador e vendedor fechem negócio com tranquilidade.
            </p>
          </div>
        </div>

        {/* Formulário + Canais diretos */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-lg p-6 sm:p-8 space-y-5">
            <div className="space-y-1">
              <h2 className="font-display text-2xl font-bold text-zinc-950">
                Solicite uma consultoria ou busca personalizada
              </h2>
              <p className="text-sm text-zinc-600">
                Informe o veículo desejado ou sua necessidade de intermediação.
              </p>
            </div>
            <LeadInterestForm />
          </div>

          <div className="lg:col-span-5 bg-[#0B0D12] text-white border border-zinc-800 rounded-lg p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#D4AF37]">
                <ShieldCheck className="w-4 h-4" />
                <span>CANAIS OFICIAIS</span>
              </div>
              <h2 className="font-display text-2xl font-bold">Fale diretamente com a equipe</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Prefere atendimento imediato? Utilize nossos canais oficiais abaixo.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={buildWhatsAppUrl('Olá! Gostaria de falar sobre consultoria ou intermediação na AS Auto Dreams.')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-md bg-zinc-900 border border-zinc-800 hover:border-[#C9A227] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-[#22C55E]" />
                  <div>
                    <p className="text-sm font-semibold text-white">WhatsApp Oficial</p>
                    <p className="text-xs text-zinc-400 tabular-nums">{BRAND_CONFIG.whatsappDisplay}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#E5C158]">Abrir →</span>
              </a>

              <a
                href={BRAND_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-md bg-zinc-900 border border-zinc-800 hover:border-[#C9A227] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Instagram className="w-5 h-5 text-[#E5C158]" />
                  <div>
                    <p className="text-sm font-semibold text-white">Instagram</p>
                    <p className="text-xs text-zinc-400">{BRAND_CONFIG.instagramHandle}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#E5C158]">Seguir →</span>
              </a>

              <a
                href={BRAND_CONFIG.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-md bg-zinc-900 border border-zinc-800 hover:border-[#C9A227] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Facebook className="w-5 h-5 text-[#E5C158]" />
                  <div>
                    <p className="text-sm font-semibold text-white">Facebook</p>
                    <p className="text-xs text-zinc-400">{BRAND_CONFIG.facebookName}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#E5C158]">Visitar →</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

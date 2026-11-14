import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, MessageCircle, Shield, Sparkles } from 'lucide-react';
import { BRAND_CONFIG, buildWhatsAppUrl } from '../config/brand';
import { listVehicles } from '../services/vehicleService';
import type { Vehicle } from '../types/database';
import { VehicleCard } from '../components/VehicleCard';
import { LeadInterestForm } from '../components/LeadInterestForm';

export function HomePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'AS Auto Dreams | Consultoria e Intermediação Automotiva';
    let mounted = true;
    listVehicles()
      .then((data) => {
        if (mounted) setVehicles(data);
      })
      .catch(() => {
        if (mounted) setVehicles([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const availableOrReserved = vehicles.filter((v) => v.status !== 'vendido');
  const featuredVehicles = availableOrReserved.filter((v) => v.featured).slice(0, 3);
  const latestVehicles = vehicles.slice(0, 6);

  return (
    <div>
      {/* 1. HERO AUTOMOTIVO */}
      <section className="relative bg-black text-white overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0">
          <img
            src={BRAND_CONFIG.heroImagePath}
            alt="Showroom AS Auto Dreams"
            className="w-full h-full object-cover object-center opacity-70"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <p className="text-xs sm:text-sm font-medium tracking-widest text-[#D4AF37]">
                {BRAND_CONFIG.companyName} · {BRAND_CONFIG.companySubtitle}
              </p>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.08] text-white [text-wrap:balance]">
                Encontre seu próximo veículo com confiança.
              </h1>

              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl">
                Curadoria especializada, verificação de procedência e intermediação transparente conduzida diretamente por{' '}
                <span className="text-white font-medium">{BRAND_CONFIG.ceoName}</span> para você comprar ou vender com segurança.
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
                <Link
                  to="/catalogo"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-black bg-gradient-to-r from-[#E5C158] to-[#C9A227] rounded-md hover:brightness-110 transition-all whitespace-nowrap"
                >
                  <span>Ver veículos disponíveis</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={buildWhatsAppUrl('Olá! Vim pela página inicial da AS Auto Dreams e gostaria de falar com um consultor.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-zinc-900/90 border border-zinc-700 rounded-md hover:border-[#C9A227] hover:bg-zinc-900 transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4 text-[#22C55E]" />
                  <span>Fale pelo WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-start lg:justify-end">
              <div className="bg-black/80 border border-zinc-800 rounded-lg p-6 sm:p-8 max-w-sm w-full flex flex-col items-center text-center">
                <img
                  src={BRAND_CONFIG.logoPath}
                  alt="Logomarca oficial AS Auto Dreams"
                  className="w-full max-w-[260px] h-auto object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="w-full h-px bg-zinc-800 my-5" />
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Consultoria automotiva sob medida · Atendimento direto via WhatsApp{' '}
                  <span className="text-zinc-200 tabular-nums">{BRAND_CONFIG.whatsappDisplay}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VEÍCULOS EM DESTAQUE & ÚLTIMOS CADASTRADOS (Área clara de leitura) */}
      <section className="bg-[#F8F8F9] text-zinc-900 py-16 sm:py-20 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {/* Destaques (exibido quando há veículos marcados como destaque) */}
          {featuredVehicles.length > 0 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-widest text-[#9A7818]">SELEÇÃO ESPECIAL</p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 mt-1">
                    Veículos em destaque
                  </h2>
                </div>
                <Link
                  to="/catalogo"
                  className="text-sm font-semibold text-zinc-800 hover:text-black inline-flex items-center gap-1.5"
                >
                  <span>Explorar catálogo completo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} variant="light" />
                ))}
              </div>
            </div>
          )}

          {/* Últimos veículos cadastrados */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-widest text-[#9A7818]">VITRINE ATUALIZADA</p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 mt-1">
                  Últimos veículos cadastrados
                </h2>
              </div>
              <Link
                to="/catalogo"
                className="text-sm font-semibold text-zinc-800 hover:text-black inline-flex items-center gap-1.5"
              >
                <span>Ver todos os veículos</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="bg-white border border-zinc-200 rounded-lg overflow-hidden animate-pulse"
                  >
                    <div className="aspect-4/3 bg-zinc-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-3 w-1/3 bg-zinc-200 rounded" />
                      <div className="h-5 w-2/3 bg-zinc-200 rounded" />
                      <div className="h-4 w-1/2 bg-zinc-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : latestVehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} variant="light" />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-lg p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-5">
                <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 flex items-center justify-center text-[#9A7818]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-xl font-semibold text-zinc-950">
                    Acervo em atualização pela nossa consultoria
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed max-w-xl mx-auto">
                    Trabalhamos apenas com veículos reais selecionados e verificados. No momento, não há anúncios publicados diretamente na vitrine, mas realizamos busca personalizada sob encomenda para encontrar o modelo exato que você procura.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <a
                    href={buildWhatsAppUrl(
                      'Olá! Gostaria de solicitar uma consultoria para encontrar um veículo pela AS Auto Dreams.'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-black bg-gradient-to-r from-[#E5C158] to-[#C9A227] rounded-md hover:brightness-110 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Solicitar busca pelo WhatsApp</span>
                  </a>
                  <Link
                    to="/consultoria"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-zinc-800 border border-zinc-300 rounded-md hover:bg-zinc-100 transition-colors"
                  >
                    <span>Enviar pedido de veículo</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. CONSULTORIA, INTERMEDIAÇÃO E VANTAGENS DA EMPRESA */}
      <section className="bg-[#0B0D12] text-zinc-100 py-16 sm:py-24 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 space-y-8 flex flex-col justify-between">
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-widest text-[#D4AF37]">
                  CONSULTORIA + INTERMEDIAÇÃO
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight [text-wrap:balance]">
                  Segurança técnica e transparência em cada etapa da negociação.
                </h2>
                <p className="text-base text-zinc-300 leading-relaxed">
                  A AS Auto Dreams atua de forma consultiva na compra e intermediação de veículos, conectando compradores exigentes e proprietários reais com acompanhamento completo do início à transferência.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="border-t border-zinc-800 pt-4 space-y-2">
                  <p className="text-xs font-mono text-[#D4AF37]">01</p>
                  <h3 className="font-display text-base font-semibold text-white">
                    Curadoria de Procedência
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Seleção criteriosa de histórico, quilometragem e estado de conservação antes da divulgação.
                  </p>
                </div>

                <div className="border-t border-zinc-800 pt-4 space-y-2">
                  <p className="text-xs font-mono text-[#D4AF37]">02</p>
                  <h3 className="font-display text-base font-semibold text-white">
                    Intermediação Justa
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Negociação clara entre as partes, com referência FIPE e condições comerciais objetivas.
                  </p>
                </div>

                <div className="border-t border-zinc-800 pt-4 space-y-2">
                  <p className="text-xs font-mono text-[#D4AF37]">03</p>
                  <h3 className="font-display text-base font-semibold text-white">
                    Consultoria Personalizada
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Atendimento direto para identificar o veículo ideal conforme perfil de uso e orçamento.
                  </p>
                </div>

                <div className="border-t border-zinc-800 pt-4 space-y-2">
                  <p className="text-xs font-mono text-[#D4AF37]">04</p>
                  <h3 className="font-display text-base font-semibold text-white">
                    Apoio Documental
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Orientação completa na conferência de documentos e formalização segura da transferência.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col">
              <div className="relative rounded-lg overflow-hidden border border-zinc-800 flex-1 min-h-[320px]">
                <img
                  src={BRAND_CONFIG.loungeImagePath}
                  alt="Ambiente de consultoria automotiva AS Auto Dreams"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#E5C158]">
                    <Shield className="w-4 h-4" />
                    <span>Atendimento conduzido por {BRAND_CONFIG.ceoName}</span>
                  </div>
                  <p className="text-sm sm:text-base text-zinc-200 leading-relaxed">
                    “Consultando seus sonhos. Conduzindo suas conquistas.”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CAPTAÇÃO DE INTERESSE / CONTATO DIRETO */}
      <section className="bg-white text-zinc-900 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-5">
              <p className="text-xs font-semibold tracking-widest text-[#9A7818]">ATENDIMENTO CONSULTIVO</p>
              <h2 className="font-display text-3xl font-bold text-zinc-950 [text-wrap:balance]">
                Procurando um veículo específico ou quer anunciar com segurança?
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                Deixe seu contato ou fale diretamente pelo WhatsApp. Analisamos sua necessidade e apresentamos opções reais com transparência.
              </p>

              <ul className="space-y-3 pt-2 text-sm text-zinc-700">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#9A7818] shrink-0" />
                  <span>Resposta rápida pelo WhatsApp {BRAND_CONFIG.whatsappDisplay}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#9A7818] shrink-0" />
                  <span>Consultoria para compra, avaliação e intermediação</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#9A7818] shrink-0" />
                  <span>Proteção dos seus dados conforme a LGPD</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7 bg-[#F8F8F9] border border-zinc-200 rounded-lg p-6 sm:p-8">
              <LeadInterestForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

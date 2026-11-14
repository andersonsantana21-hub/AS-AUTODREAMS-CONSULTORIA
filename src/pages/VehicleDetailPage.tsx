import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Car,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Expand,
  MessageCircle,
  ShieldCheck,
  X,
} from 'lucide-react';
import { LeadInterestForm } from '../components/LeadInterestForm';
import { buildVehicleWhatsAppMessage, buildWhatsAppUrl } from '../config/brand';
import { getVehicleById } from '../services/vehicleService';
import type { Vehicle } from '../types/database';
import {
  formatCurrencyBRL,
  formatMileage,
  formatVehicleYear,
  getStatusLabel,
  getVehicleFullName,
} from '../utils/formatters';

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    setActivePhotoIndex(0);

    getVehicleById(id)
      .then((found) => {
        setVehicle(found);
        if (found) {
          document.title = `${getVehicleFullName(found)} (${formatVehicleYear(
            found.manufacture_year,
            found.model_year
          )}) | AS Auto Dreams`;
        } else {
          document.title = 'Veículo não encontrado | AS Auto Dreams';
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Erro ao carregar veículo.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const scrollToInterestForm = () => {
    const el = document.getElementById('interesse-veiculo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F9] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse space-y-8">
          <div className="h-5 w-48 bg-zinc-200 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 aspect-4/3 bg-zinc-200 rounded-lg" />
            <div className="lg:col-span-5 h-96 bg-zinc-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-[#F8F8F9] py-16">
        <div className="max-w-xl mx-auto px-4 text-center space-y-4">
          <h1 className="font-display text-2xl font-bold text-zinc-950">
            {error ? 'Erro ao carregar veículo' : 'Veículo não encontrado'}
          </h1>
          <p className="text-sm text-zinc-600">
            {error || 'Este veículo pode ter sido removido ou o link está indisponível.'}
          </p>
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-zinc-950 rounded-md hover:bg-zinc-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao catálogo</span>
          </Link>
        </div>
      </div>
    );
  }

  const vehicleName = getVehicleFullName(vehicle);
  const yearLabel = formatVehicleYear(vehicle.manufacture_year, vehicle.model_year);
  const whatsappUrl = buildWhatsAppUrl(buildVehicleWhatsAppMessage(`${vehicleName} (${yearLabel})`));
  const photos = vehicle.photos.length > 0 ? vehicle.photos : [];
  const currentPhoto = photos[activePhotoIndex] || null;

  const statusMeta = {
    disponivel: { icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    reservado: { icon: Clock, color: 'text-amber-800 bg-amber-50 border-amber-200' },
    vendido: { icon: ShieldCheck, color: 'text-zinc-600 bg-zinc-100 border-zinc-200' },
  }[vehicle.status];
  const StatusIcon = statusMeta.icon;

  return (
    <div className="min-h-screen bg-[#F8F8F9] text-zinc-900 pb-16">
      {/* Navegação de retorno */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para o catálogo</span>
          </Link>
          <span className="text-xs text-zinc-500 hidden sm:inline">
            {vehicle.brand} · {vehicle.model} · {yearLabel}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* Galeria + Módulo de Negociação Contíguo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Galeria de Fotografias */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative aspect-4/3 bg-zinc-950 rounded-lg overflow-hidden border border-zinc-200">
              {currentPhoto ? (
                <>
                  <img
                    src={currentPhoto}
                    alt={`${vehicleName} - Foto ${activePhotoIndex + 1}`}
                    className="w-full h-full object-cover cursor-zoom-in"
                    referrerPolicy="no-referrer"
                    onClick={() => setLightboxOpen(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    aria-label="Ampliar fotografia"
                    className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-black/75 rounded-md hover:bg-black"
                  >
                    <Expand className="w-3.5 h-3.5" />
                    <span>Ampliar</span>
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-400">
                  <Car className="w-14 h-14 text-[#C9A227]/80" />
                  <p className="text-sm">Fotografias em preparação</p>
                </div>
              )}

              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Foto anterior"
                    onClick={() =>
                      setActivePhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Próxima foto"
                    onClick={() =>
                      setActivePhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {photos.length > 1 && (
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5">
                {photos.map((photoUrl, idx) => (
                  <button
                    key={`${photoUrl}-${idx}`}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`aspect-4/3 rounded-md overflow-hidden border-2 transition-all ${
                      idx === activePhotoIndex
                        ? 'border-[#C9A227]'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photoUrl}
                      alt={`${vehicleName} miniatura ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Módulo Principal de Preço & Ações */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 bg-white border border-zinc-200 rounded-lg p-6 sm:p-7 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold tracking-wider text-zinc-500">
                  {vehicle.brand} · {yearLabel}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded border ${statusMeta.color}`}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  <span>{getStatusLabel(vehicle.status)}</span>
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 leading-tight">
                {vehicle.brand} {vehicle.model}
              </h1>
              {vehicle.version && <p className="text-sm text-zinc-600">{vehicle.version}</p>}
            </div>

            <div className="py-4 border-y border-zinc-200 space-y-1">
              <p className="text-xs font-medium text-zinc-500">Valor de venda</p>
              <p className="font-display text-3xl sm:text-4xl font-bold text-zinc-950 tabular-nums">
                {formatCurrencyBRL(vehicle.price)}
              </p>
              {vehicle.fipe_price ? (
                <p className="text-sm text-zinc-600 tabular-nums">
                  Referência FIPE: <span className="font-semibold">{formatCurrencyBRL(vehicle.fipe_price)}</span>
                </p>
              ) : null}
            </div>

            {/* Resumo técnico rápido */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div>
                <p className="text-xs text-zinc-500">Quilometragem</p>
                <p className="font-semibold text-zinc-900 tabular-nums">{formatMileage(vehicle.mileage)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Câmbio</p>
                <p className="font-semibold text-zinc-900">{vehicle.transmission}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Combustível</p>
                <p className="font-semibold text-zinc-900">{vehicle.fuel}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Cor</p>
                <p className="font-semibold text-zinc-900">{vehicle.color || 'Sob consulta'}</p>
              </div>
            </div>

            {/* Dois Botões Principais Obrigatórios */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={scrollToInterestForm}
                className="w-full py-3.5 px-5 text-sm font-bold tracking-wide text-black bg-gradient-to-r from-[#E5C158] to-[#C9A227] rounded-md hover:brightness-110 transition-all"
              >
                TENHO INTERESSE
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 text-sm font-bold tracking-wide text-white bg-[#16A34A] hover:bg-[#15803D] rounded-md transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>FALAR PELO WHATSAPP</span>
              </a>
            </div>
          </div>
        </div>

        {/* Informações Completas, Descrição, Opcionais e Condições */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            {/* Ficha Técnica Completa */}
            <section className="bg-white border border-zinc-200 rounded-lg p-6 sm:p-8 space-y-5">
              <h2 className="font-display text-xl font-bold text-zinc-950">Informações do Veículo</h2>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-5 text-sm">
                <div>
                  <dt className="text-xs text-zinc-500">Marca</dt>
                  <dd className="font-semibold text-zinc-900 mt-0.5">{vehicle.brand}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Modelo</dt>
                  <dd className="font-semibold text-zinc-900 mt-0.5">{vehicle.model}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Versão</dt>
                  <dd className="font-semibold text-zinc-900 mt-0.5">{vehicle.version || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Ano Fab / Mod</dt>
                  <dd className="font-semibold text-zinc-900 mt-0.5 tabular-nums">{yearLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Quilometragem</dt>
                  <dd className="font-semibold text-zinc-900 mt-0.5 tabular-nums">
                    {formatMileage(vehicle.mileage)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Motorização</dt>
                  <dd className="font-semibold text-zinc-900 mt-0.5">{vehicle.engine || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Câmbio</dt>
                  <dd className="font-semibold text-zinc-900 mt-0.5">{vehicle.transmission}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Combustível</dt>
                  <dd className="font-semibold text-zinc-900 mt-0.5">{vehicle.fuel}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Cor</dt>
                  <dd className="font-semibold text-zinc-900 mt-0.5">{vehicle.color || '—'}</dd>
                </div>
              </dl>
            </section>

            {/* Descrição Detalhada */}
            {vehicle.description && (
              <section className="bg-white border border-zinc-200 rounded-lg p-6 sm:p-8 space-y-3">
                <h2 className="font-display text-xl font-bold text-zinc-950">Descrição Detalhada</h2>
                <p className="text-sm sm:text-base text-zinc-700 leading-relaxed whitespace-pre-line">
                  {vehicle.description}
                </p>
              </section>
            )}

            {/* Opcionais e Acessórios */}
            {vehicle.features.length > 0 && (
              <section className="bg-white border border-zinc-200 rounded-lg p-6 sm:p-8 space-y-4">
                <h2 className="font-display text-xl font-bold text-zinc-950">
                  Opcionais e Acessórios
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-zinc-700">
                  {vehicle.features.map((feat, idx) => (
                    <li key={`${feat}-${idx}`} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#9A7818] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Condições Comerciais */}
            {vehicle.commercial_conditions && (
              <section className="bg-white border border-zinc-200 rounded-lg p-6 sm:p-8 space-y-3">
                <h2 className="font-display text-xl font-bold text-zinc-950">
                  Condições Comerciais e Observações
                </h2>
                <p className="text-sm sm:text-base text-zinc-700 leading-relaxed whitespace-pre-line">
                  {vehicle.commercial_conditions}
                </p>
              </section>
            )}
          </div>

          {/* Formulário de Interesse Integrado */}
          <div id="interesse-veiculo" className="lg:col-span-5">
            <div className="bg-[#0B0D12] text-white border border-zinc-800 rounded-lg p-6 sm:p-8 space-y-5">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold tracking-widest text-[#D4AF37]">
                  INTERESSE DIRETO
                </p>
                <h2 className="font-display text-2xl font-bold text-white">
                  Solicitar atendimento sobre este veículo
                </h2>
                <p className="text-sm text-zinc-400">
                  Envie seus dados para nossa equipe ou continue diretamente pelo WhatsApp.
                </p>
              </div>

              <LeadInterestForm
                vehicleId={vehicle.id}
                defaultVehicleTitle={`${vehicleName} (${yearLabel})`}
                readOnlyVehicle={true}
                darkSurface={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal para fotos */}
      {lightboxOpen && currentPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Galeria ampliada"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Fechar visualização"
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800"
          >
            <X className="w-6 h-6" />
          </button>

          <img
            src={currentPhoto}
            alt={vehicleName}
            className="max-w-full max-h-[85vh] object-contain rounded"
            referrerPolicy="no-referrer"
          />

          {photos.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Foto anterior"
                onClick={() =>
                  setActivePhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-zinc-900/90 text-white flex items-center justify-center hover:bg-zinc-800"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                aria-label="Próxima foto"
                onClick={() =>
                  setActivePhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-zinc-900/90 text-white flex items-center justify-center hover:bg-zinc-800"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

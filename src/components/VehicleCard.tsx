import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import type { Vehicle } from '../types/database';
import {
  formatCurrencyBRL,
  formatMileage,
  formatVehicleYear,
  getStatusLabel,
} from '../utils/formatters';

interface VehicleCardProps {
  vehicle: Vehicle;
  variant?: 'light' | 'dark';
}

export function VehicleCard({ vehicle, variant = 'light' }: VehicleCardProps) {
  const [imgError, setImgError] = useState(false);
  const coverPhoto = vehicle.photos[0];
  const isDark = variant === 'dark';

  const statusConfig = {
    disponivel: {
      icon: CheckCircle2,
      textClass: isDark ? 'text-emerald-400' : 'text-emerald-700',
    },
    reservado: {
      icon: Clock,
      textClass: isDark ? 'text-amber-400' : 'text-amber-700',
    },
    vendido: {
      icon: ShieldCheck,
      textClass: isDark ? 'text-zinc-400' : 'text-zinc-500',
    },
  }[vehicle.status];

  const StatusIcon = statusConfig.icon;

  return (
    <Link
      to={`/veiculo/${vehicle.id}`}
      className={`group flex flex-col overflow-hidden rounded-lg border transition-all duration-200 hover:-translate-y-0.5 ${
        isDark
          ? 'bg-[#12141A] border-zinc-800 hover:border-[#C9A227]/60'
          : 'bg-white border-zinc-200 hover:border-zinc-400 shadow-xs hover:shadow-md'
      }`}
    >
      {/* 4:3 Image Container */}
      <div
        className={`relative aspect-4/3 w-full overflow-hidden ${
          isDark ? 'bg-[#090A0D]' : 'bg-zinc-100'
        }`}
      >
        {coverPhoto && !imgError ? (
          <img
            src={coverPhoto}
            alt={`${vehicle.brand} ${vehicle.model} ${vehicle.version}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-900 via-[#151821] to-black text-zinc-400 px-4 text-center">
            <Car className="w-10 h-10 text-[#C9A227]/80" />
            <span className="text-xs font-medium text-zinc-300">
              {vehicle.brand} {vehicle.model}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Top unboxed metadata row */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className={`font-medium truncate ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {vehicle.brand} · {formatVehicleYear(vehicle.manufacture_year, vehicle.model_year)}
          </span>
          <span className={`inline-flex items-center gap-1 font-medium shrink-0 ${statusConfig.textClass}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{getStatusLabel(vehicle.status)}</span>
          </span>
        </div>

        {/* Title */}
        <div>
          <h3
            className={`font-display text-lg font-semibold leading-snug line-clamp-1 ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}
          >
            {vehicle.brand} {vehicle.model}
          </h3>
          <p
            className={`text-sm line-clamp-1 mt-0.5 ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}
          >
            {vehicle.version || vehicle.engine || 'Versão sob consulta'}
          </p>
        </div>

        {/* Specs line */}
        <div
          className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tabular-nums ${
            isDark ? 'text-zinc-400' : 'text-zinc-600'
          }`}
        >
          <span>{formatMileage(vehicle.mileage)}</span>
          <span aria-hidden="true">·</span>
          <span>{vehicle.transmission}</span>
          <span aria-hidden="true">·</span>
          <span>{vehicle.fuel}</span>
        </div>

        {/* Price footer */}
        <div
          className={`mt-auto pt-3 border-t flex items-baseline justify-between gap-2 ${
            isDark ? 'border-zinc-800/80' : 'border-zinc-100'
          }`}
        >
          <div>
            <p
              className={`font-display text-xl font-bold tabular-nums ${
                isDark ? 'text-[#E5C158]' : 'text-zinc-950'
              }`}
            >
              {formatCurrencyBRL(vehicle.price)}
            </p>
            {vehicle.fipe_price ? (
              <p className={`text-xs tabular-nums ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                FIPE {formatCurrencyBRL(vehicle.fipe_price)}
              </p>
            ) : null}
          </div>
          <span
            className={`text-xs font-semibold whitespace-nowrap ${
              isDark ? 'text-zinc-300 group-hover:text-[#E5C158]' : 'text-zinc-700 group-hover:text-black'
            }`}
          >
            Ver detalhes →
          </span>
        </div>
      </div>
    </Link>
  );
}

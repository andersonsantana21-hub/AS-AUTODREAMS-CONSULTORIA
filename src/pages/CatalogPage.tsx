import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Filter, MessageCircle, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { VehicleCard } from '../components/VehicleCard';
import { buildWhatsAppUrl } from '../config/brand';
import { listVehicles } from '../services/vehicleService';
import type { Vehicle, VehicleFilters } from '../types/database';

const INITIAL_FILTERS: VehicleFilters = {
  search: '',
  brand: '',
  model: '',
  year: '',
  minPrice: '',
  maxPrice: '',
  transmission: '',
  fuel: '',
  status: '',
};

export function CatalogPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<VehicleFilters>(INITIAL_FILTERS);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const fetchCatalog = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar veículos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Catálogo de Veículos | AS Auto Dreams';
    fetchCatalog();
  }, []);

  const brandOptions = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.brand).filter(Boolean))).sort(),
    [vehicles]
  );

  const modelOptions = useMemo(() => {
    const source = filters.brand ? vehicles.filter((v) => v.brand === filters.brand) : vehicles;
    return Array.from(new Set(source.map((v) => v.model).filter(Boolean))).sort();
  }, [vehicles, filters.brand]);

  const yearOptions = useMemo(
    () =>
      Array.from(new Set(vehicles.map((v) => String(v.model_year)).filter(Boolean))).sort((a, b) =>
        b.localeCompare(a)
      ),
    [vehicles]
  );

  const transmissionOptions = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.transmission).filter(Boolean))).sort(),
    [vehicles]
  );

  const fuelOptions = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.fuel).filter(Boolean))).sort(),
    [vehicles]
  );

  const filteredVehicles = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const minP = filters.minPrice ? Number(filters.minPrice) : null;
    const maxP = filters.maxPrice ? Number(filters.maxPrice) : null;

    return vehicles.filter((v) => {
      if (query) {
        const searchable = `${v.brand} ${v.model} ${v.version} ${v.engine} ${v.color}`.toLowerCase();
        if (!searchable.includes(query)) return false;
      }
      if (filters.brand && v.brand !== filters.brand) return false;
      if (filters.model && v.model !== filters.model) return false;
      if (filters.year && String(v.model_year) !== filters.year) return false;
      if (filters.transmission && v.transmission !== filters.transmission) return false;
      if (filters.fuel && v.fuel !== filters.fuel) return false;
      if (filters.status && v.status !== filters.status) return false;
      if (minP !== null && !Number.isNaN(minP) && v.price < minP) return false;
      if (maxP !== null && !Number.isNaN(maxP) && v.price > maxP) return false;
      return true;
    });
  }, [vehicles, filters]);

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  const updateFilter = (key: keyof VehicleFilters, value: string) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'brand') next.model = '';
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F8F9] text-zinc-900">
      {/* Cabeçalho escuro da vitrine */}
      <section className="bg-[#0B0D12] text-white border-b border-zinc-800 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="text-xs font-semibold tracking-widest text-[#D4AF37]">VITRINE OFICIAL</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
                Catálogo de Veículos
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 mt-1.5">
                Filtre por marca, modelo, ano, câmbio, combustível ou faixa de valor.
              </p>
            </div>
            <p className="text-sm text-zinc-300 tabular-nums">
              {filteredVehicles.length}{' '}
              {filteredVehicles.length === 1 ? 'veículo encontrado' : 'veículos encontrados'}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Barra de pesquisa e controle de filtros mobile */}
        <div className="bg-white border border-zinc-200 rounded-lg p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Pesquisar por nome do veículo, marca, modelo ou versão..."
                aria-label="Pesquisar veículo"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F8F8F9] border border-zinc-300 rounded-md text-zinc-900 placeholder:text-zinc-500 outline-none focus:border-zinc-900"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowFiltersMobile((prev) => !prev)}
              className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold border border-zinc-300 rounded-md text-zinc-800 bg-white hover:bg-zinc-50"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{showFiltersMobile ? 'Ocultar filtros' : 'Filtros avançados'}</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => setFilters(INITIAL_FILTERS)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-700 border border-zinc-300 rounded-md hover:bg-zinc-100 whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Limpar filtros</span>
              </button>
            )}
          </div>

          {/* Grid de filtros */}
          <div
            className={`${
              showFiltersMobile ? 'grid' : 'hidden lg:grid'
            } grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-zinc-100`}
          >
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">Marca</label>
              <select
                value={filters.brand}
                onChange={(e) => updateFilter('brand', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900 outline-none focus:border-zinc-900"
              >
                <option value="">Todas as marcas</option>
                {brandOptions.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">Modelo</label>
              <select
                value={filters.model}
                onChange={(e) => updateFilter('model', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900 outline-none focus:border-zinc-900"
              >
                <option value="">Todos os modelos</option>
                {modelOptions.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">Ano modelo</label>
              <select
                value={filters.year}
                onChange={(e) => updateFilter('year', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900 outline-none focus:border-zinc-900 tabular-nums"
              >
                <option value="">Todos os anos</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">Situação</label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900 outline-none focus:border-zinc-900"
              >
                <option value="">Todas as situações</option>
                <option value="disponivel">Disponível</option>
                <option value="reservado">Reservado</option>
                <option value="vendido">Vendido</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">Câmbio</label>
              <select
                value={filters.transmission}
                onChange={(e) => updateFilter('transmission', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900 outline-none focus:border-zinc-900"
              >
                <option value="">Todos os câmbios</option>
                {transmissionOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">Combustível</label>
              <select
                value={filters.fuel}
                onChange={(e) => updateFilter('fuel', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900 outline-none focus:border-zinc-900"
              >
                <option value="">Todos os combustíveis</option>
                {fuelOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">Preço mínimo (R$)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                placeholder="Ex: 50000"
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900 outline-none focus:border-zinc-900 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">Preço máximo (R$)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                placeholder="Ex: 200000"
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-900 outline-none focus:border-zinc-900 tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Estado de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center space-y-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              type="button"
              onClick={fetchCatalog}
              className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 rounded-md hover:bg-zinc-800"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Listagem */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white border border-zinc-200 rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-4/3 bg-zinc-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-1/3 bg-zinc-200 rounded" />
                  <div className="h-5 w-2/3 bg-zinc-200 rounded" />
                  <div className="h-4 w-1/2 bg-zinc-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} variant="light" />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-lg p-10 text-center max-w-2xl mx-auto space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
              {hasActiveFilters ? <Filter className="w-6 h-6" /> : <Car className="w-6 h-6" />}
            </div>
            <h2 className="font-display text-xl font-semibold text-zinc-950">
              {hasActiveFilters
                ? 'Nenhum veículo corresponde aos filtros selecionados'
                : 'Nenhum veículo publicado no catálogo no momento'}
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              {hasActiveFilters
                ? 'Experimente ajustar a busca ou limpar os filtros para visualizar outras opções.'
                : 'Nossa consultoria realiza buscas sob encomenda com procedência verificada. Fale diretamente com nossa equipe para consultar disponibilidade.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => setFilters(INITIAL_FILTERS)}
                  className="px-5 py-2.5 text-sm font-semibold text-zinc-900 border border-zinc-300 rounded-md hover:bg-zinc-100"
                >
                  Limpar filtros
                </button>
              )}
              <a
                href={buildWhatsAppUrl(
                  'Olá! Procuro um veículo através da consultoria da AS Auto Dreams.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-black bg-gradient-to-r from-[#E5C158] to-[#C9A227] rounded-md hover:brightness-110"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Consultar pelo WhatsApp</span>
              </a>
              <Link
                to="/consultoria"
                className="px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:text-black"
              >
                Solicitar busca personalizada →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

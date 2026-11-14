import { useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowLeft, Plus, Star, Trash2, Upload, X } from 'lucide-react';
import { uploadVehiclePhoto } from '../services/vehicleService';
import type { Vehicle, VehiclePayload, VehicleStatus } from '../types/database';

interface AdminVehicleFormProps {
  initialVehicle?: Vehicle | null;
  onCancel: () => void;
  onSave: (payload: VehiclePayload) => Promise<void>;
}

const TRANSMISSION_OPTIONS = ['Automático', 'Manual', 'CVT', 'Automatizado'];
const FUEL_OPTIONS = ['Flex', 'Gasolina', 'Etanol', 'Diesel', 'Híbrido', 'Elétrico'];

export function AdminVehicleForm({ initialVehicle, onCancel, onSave }: AdminVehicleFormProps) {
  const currentYear = new Date().getFullYear();

  const [brand, setBrand] = useState(initialVehicle?.brand || '');
  const [model, setModel] = useState(initialVehicle?.model || '');
  const [version, setVersion] = useState(initialVehicle?.version || '');
  const [manufactureYear, setManufactureYear] = useState(
    String(initialVehicle?.manufacture_year || currentYear)
  );
  const [modelYear, setModelYear] = useState(String(initialVehicle?.model_year || currentYear));
  const [mileage, setMileage] = useState(String(initialVehicle?.mileage ?? 0));
  const [transmission, setTransmission] = useState(initialVehicle?.transmission || 'Automático');
  const [engine, setEngine] = useState(initialVehicle?.engine || '');
  const [fuel, setFuel] = useState(initialVehicle?.fuel || 'Flex');
  const [color, setColor] = useState(initialVehicle?.color || '');
  const [price, setPrice] = useState(initialVehicle ? String(initialVehicle.price) : '');
  const [fipePrice, setFipePrice] = useState(
    initialVehicle?.fipe_price ? String(initialVehicle.fipe_price) : ''
  );
  const [status, setStatus] = useState<VehicleStatus>(initialVehicle?.status || 'disponivel');
  const [featured, setFeatured] = useState(Boolean(initialVehicle?.featured));
  const [description, setDescription] = useState(initialVehicle?.description || '');
  const [commercialConditions, setCommercialConditions] = useState(
    initialVehicle?.commercial_conditions || ''
  );

  const [features, setFeatures] = useState<string[]>(initialVehicle?.features || []);
  const [featureInput, setFeatureInput] = useState('');

  const [photos, setPhotos] = useState<string[]>(initialVehicle?.photos || []);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAddFeature = () => {
    const items = featureInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length === 0) return;
    setFeatures((prev) => Array.from(new Set([...prev, ...items])));
    setFeatureInput('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);
    setError('');
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadVehiclePhoto(file);
        uploadedUrls.push(url);
      }
      setPhotos((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao enviar fotografias.');
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const handleAddPhotoUrl = () => {
    const url = photoUrlInput.trim();
    if (!url) return;
    setPhotos((prev) => [...prev, url]);
    setPhotoUrlInput('');
  };

  const handleMakeCover = (idx: number) => {
    setPhotos((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(idx, 1);
      return [selected, ...copy];
    });
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!brand.trim() || !model.trim()) {
      setError('Marca e modelo são obrigatórios.');
      return;
    }

    const numericPrice = Number(price);
    if (!price || Number.isNaN(numericPrice) || numericPrice <= 0) {
      setError('Informe um preço de venda válido.');
      return;
    }

    const payload: VehiclePayload = {
      brand: brand.trim(),
      model: model.trim(),
      version: version.trim(),
      manufacture_year: Number(manufactureYear) || currentYear,
      model_year: Number(modelYear) || currentYear,
      mileage: Math.max(0, Number(mileage) || 0),
      transmission,
      engine: engine.trim(),
      fuel,
      color: color.trim(),
      price: numericPrice,
      fipe_price: fipePrice ? Number(fipePrice) : null,
      description: description.trim(),
      features,
      commercial_conditions: commercialConditions.trim(),
      status,
      featured,
      photos,
    };

    setSaving(true);
    try {
      await onSave(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar veículo.');
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 sm:p-8 space-y-6">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-950">
            {initialVehicle ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Preencha os dados completos para publicação na loja virtual.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-zinc-700 border border-zinc-300 rounded-md hover:bg-zinc-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identificação */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Marca *</label>
            <input
              type="text"
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Ex: Toyota"
              className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-md outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Modelo *</label>
            <input
              type="text"
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Ex: Corolla"
              className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-md outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Versão</label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="Ex: Altis Hybrid 1.8"
              className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-md outline-none focus:border-zinc-900"
            />
          </div>
        </div>

        {/* Ano, KM e Preço */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Ano Fab. *</label>
            <input
              type="number"
              required
              min="1950"
              max="2100"
              value={manufactureYear}
              onChange={(e) => setManufactureYear(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-md outline-none focus:border-zinc-900 tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Ano Mod. *</label>
            <input
              type="number"
              required
              min="1950"
              max="2100"
              value={modelYear}
              onChange={(e) => setModelYear(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-md outline-none focus:border-zinc-900 tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Quilometragem *</label>
            <input
              type="number"
              required
              min="0"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-md outline-none focus:border-zinc-900 tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Preço (R$) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="125000"
              className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-md outline-none focus:border-zinc-900 tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Valor FIPE (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={fipePrice}
              onChange={(e) => setFipePrice(e.target.value)}
              placeholder="Opcional"
              className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-md outline-none focus:border-zinc-900 tabular-nums"
            />
          </div>
        </div>

        {/* Mecânica & Situação */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Câmbio *</label>
            <select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-md outline-none focus:border-zinc-900 bg-white"
            >
              {TRANSMISSION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Combustível *</label>
            <select
              value={fuel}
              onChange={(e) => setFuel(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-md outline-none focus:border-zinc-900 bg-white"
            >
              {FUEL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Motorização</label>
            <input
              type="text"
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
              placeholder="Ex: 2.0 Turbo"
              className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-md outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Cor</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Ex: Preto"
              className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-md outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Situação *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VehicleStatus)}
              className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-md outline-none focus:border-zinc-900 bg-white"
            >
              <option value="disponivel">Disponível</option>
              <option value="reservado">Reservado</option>
              <option value="vendido">Vendido</option>
            </select>
          </div>
        </div>

        {/* Destaque */}
        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="w-4 h-4 accent-[#C9A227]"
          />
          <span className="text-sm font-medium text-zinc-800">
            Exibir na seção “Veículos em destaque” da página inicial
          </span>
        </label>

        {/* Fotografias */}
        <div className="space-y-3 pt-2 border-t border-zinc-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Fotografias do Veículo</h3>
              <p className="text-xs text-zinc-500">
                Envie arquivos diretamente do celular ou computador (a primeira foto será a capa).
              </p>
            </div>

            <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-black bg-gradient-to-r from-[#E5C158] to-[#C9A227] rounded-md cursor-pointer hover:brightness-110">
              <Upload className="w-4 h-4" />
              <span>{uploadingPhotos ? 'Enviando fotos...' : 'Selecionar fotos'}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploadingPhotos}
                onChange={handleFileUpload}
                className="sr-only"
              />
            </label>
          </div>

          {/* Adicionar URL externa opcional */}
          <div className="flex gap-2">
            <input
              type="url"
              value={photoUrlInput}
              onChange={(e) => setPhotoUrlInput(e.target.value)}
              placeholder="Ou cole a URL de uma imagem (opcional)..."
              className="flex-1 px-3 py-2 text-sm border border-zinc-300 rounded-md outline-none focus:border-zinc-900"
            />
            <button
              type="button"
              onClick={handleAddPhotoUrl}
              className="px-4 py-2 text-xs font-semibold text-zinc-800 border border-zinc-300 rounded-md hover:bg-zinc-100"
            >
              Adicionar URL
            </button>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
              {photos.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  className="relative group rounded-md overflow-hidden border border-zinc-200 bg-zinc-100 aspect-4/3"
                >
                  <img
                    src={url}
                    alt={`Foto ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-black/75 flex items-center justify-between gap-1">
                    {idx === 0 ? (
                      <span className="text-[11px] font-semibold text-[#E5C158] px-1">Capa</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMakeCover(idx)}
                        className="inline-flex items-center gap-1 text-[11px] text-white hover:text-[#E5C158] px-1"
                        title="Definir como capa"
                      >
                        <Star className="w-3 h-3" />
                        <span>Capa</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      aria-label="Remover foto"
                      className="text-zinc-300 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Descrição & Condições */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-200">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Descrição detalhada
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Histórico do veículo, revisões, laudo cautelar, estado geral..."
              className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-md outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Condições comerciais e informações adicionais
            </label>
            <textarea
              rows={4}
              value={commercialConditions}
              onChange={(e) => setCommercialConditions(e.target.value)}
              placeholder="Aceita financiamento, troca, IPVA pago, garantia ou observações de intermediação..."
              className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-md outline-none focus:border-zinc-900"
            />
          </div>
        </div>

        {/* Opcionais */}
        <div className="space-y-3 pt-2 border-t border-zinc-200">
          <label className="block text-xs font-semibold text-zinc-700">
            Opcionais e Acessórios
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
              placeholder="Digite um ou vários separados por vírgula (Ex: Teto solar, Bancos em couro, Multimídia)"
              className="flex-1 px-3 py-2 text-sm border border-zinc-300 rounded-md outline-none focus:border-zinc-900"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-900 border border-zinc-300 rounded-md hover:bg-zinc-100"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </div>

          {features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {features.map((item, idx) => (
                <span
                  key={`${item}-${idx}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-zinc-100 border border-zinc-200 rounded text-zinc-800"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    aria-label={`Remover ${item}`}
                    className="text-zinc-500 hover:text-red-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-zinc-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 text-sm font-medium text-zinc-700 border border-zinc-300 rounded-md hover:bg-zinc-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || uploadingPhotos}
            className="px-6 py-3 text-sm font-semibold text-black bg-gradient-to-r from-[#E5C158] to-[#C9A227] rounded-md hover:brightness-110 disabled:opacity-60"
          >
            {saving ? 'Salvando...' : initialVehicle ? 'Salvar alterações' : 'Publicar veículo'}
          </button>
        </div>
      </form>
    </div>
  );
}

import { useState, type FormEvent } from 'react';
import { CheckCircle2, MessageCircle, Send } from 'lucide-react';
import { buildWhatsAppUrl } from '../config/brand';
import { createLead } from '../services/leadService';
import { formatPhoneInput, sanitizePhoneDigits } from '../utils/formatters';

interface LeadInterestFormProps {
  vehicleId?: string | null;
  defaultVehicleTitle?: string;
  readOnlyVehicle?: boolean;
  darkSurface?: boolean;
}

export function LeadInterestForm({
  vehicleId = null,
  defaultVehicleTitle = '',
  readOnlyVehicle = false,
  darkSurface = false,
}: LeadInterestFormProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleTitle, setVehicleTitle] = useState(defaultVehicleTitle);
  const [message, setMessage] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedData, setSubmittedData] = useState<{
    fullName: string;
    vehicleTitle: string;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = fullName.trim();
    const digits = sanitizePhoneDigits(phone);
    const desiredVehicle = vehicleTitle.trim() || 'Consultoria Automotiva AS Auto Dreams';

    if (trimmedName.length < 3) {
      setError('Informe seu nome completo.');
      return;
    }
    if (digits.length < 10) {
      setError('Informe um telefone ou WhatsApp válido com DDD.');
      return;
    }
    if (!lgpdConsent) {
      setError('É necessário autorizar o tratamento dos dados conforme a LGPD.');
      return;
    }

    setSubmitting(true);
    try {
      await createLead({
        vehicle_id: vehicleId,
        vehicle_title: desiredVehicle,
        full_name: trimmedName,
        phone: phone.trim(),
        message: message.trim(),
        lgpd_consent: true,
      });

      setSubmittedData({
        fullName: trimmedName,
        vehicleTitle: desiredVehicle,
        message: message.trim(),
      });
      setFullName('');
      setPhone('');
      if (!readOnlyVehicle) setVehicleTitle('');
      setMessage('');
      setLgpdConsent(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar solicitação.');
    } finally {
      setSubmitting(false);
    }
  };

  const labelClass = darkSurface ? 'text-zinc-200' : 'text-zinc-800';
  const inputClass = darkSurface
    ? 'bg-[#0C0E13] border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#C9A227]'
    : 'bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900';

  if (submittedData) {
    const waMessage = `Olá! Meu nome é ${submittedData.fullName}. Registrei meu interesse no site da AS Auto Dreams sobre: ${submittedData.vehicleTitle}.${
      submittedData.message ? ` Mensagem: ${submittedData.message}` : ''
    }`;

    return (
      <div
        className={`p-6 rounded-lg border space-y-4 ${
          darkSurface
            ? 'bg-[#12141A] border-emerald-700/60 text-zinc-100'
            : 'bg-emerald-50 border-emerald-200 text-zinc-900'
        }`}
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-display text-lg font-semibold">Interesse registrado com sucesso</h3>
            <p className={`text-sm ${darkSurface ? 'text-zinc-300' : 'text-zinc-700'}`}>
              Recebemos seus dados para atendimento consultivo sobre{' '}
              <strong className="font-semibold">{submittedData.vehicleTitle}</strong>. Nossa equipe entrará em contato em breve.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={buildWhatsAppUrl(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-md transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enviar agora pelo WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={() => setSubmittedData(null)}
            className={`px-4 py-3 text-sm font-medium rounded-md border transition-colors ${
              darkSurface
                ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                : 'border-zinc-300 text-zinc-700 hover:bg-white'
            }`}
          >
            Enviar outra solicitação
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-md bg-red-500/10 border border-red-500/40 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lead-name" className={`block text-xs font-semibold mb-1.5 ${labelClass}`}>
            Nome completo *
          </label>
          <input
            id="lead-name"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Seu nome completo"
            className={`w-full px-3.5 py-2.5 text-sm rounded-md border outline-none transition-colors ${inputClass}`}
          />
        </div>

        <div>
          <label htmlFor="lead-phone" className={`block text-xs font-semibold mb-1.5 ${labelClass}`}>
            Telefone / WhatsApp *
          </label>
          <input
            id="lead-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
            placeholder="(92) 99999-9999"
            className={`w-full px-3.5 py-2.5 text-sm rounded-md border outline-none transition-colors tabular-nums ${inputClass}`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="lead-vehicle" className={`block text-xs font-semibold mb-1.5 ${labelClass}`}>
          Veículo desejado *
        </label>
        <input
          id="lead-vehicle"
          type="text"
          required
          readOnly={readOnlyVehicle}
          value={vehicleTitle}
          onChange={(e) => setVehicleTitle(e.target.value)}
          placeholder="Ex: SUV, Sedan Executivo ou modelo específico"
          className={`w-full px-3.5 py-2.5 text-sm rounded-md border outline-none transition-colors ${
            readOnlyVehicle ? 'opacity-85 cursor-default' : ''
          } ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="lead-message" className={`block text-xs font-semibold mb-1.5 ${labelClass}`}>
          Mensagem (opcional)
        </label>
        <textarea
          id="lead-message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Conte-nos sua preferência de negociação, troca ou horário para retorno."
          className={`w-full px-3.5 py-2.5 text-sm rounded-md border outline-none transition-colors resize-y ${inputClass}`}
        />
      </div>

      {/* Consentimento LGPD */}
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={lgpdConsent}
          onChange={(e) => setLgpdConsent(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-zinc-400 accent-[#C9A227] shrink-0"
          required
        />
        <span className={`text-xs leading-relaxed ${darkSurface ? 'text-zinc-400' : 'text-zinc-600'}`}>
          Autorizo a AS Auto Dreams Consultoria + Intermediação a utilizar meus dados de contato exclusivamente para retorno sobre este atendimento automotivo, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
        </span>
      </label>

      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-black bg-gradient-to-r from-[#E5C158] to-[#C9A227] rounded-md hover:brightness-110 transition-all disabled:opacity-60"
        >
          <Send className="w-4 h-4" />
          <span>{submitting ? 'Enviando...' : 'Enviar interesse'}</span>
        </button>

        <a
          href={buildWhatsAppUrl(
            `Olá! Gostaria de informações sobre: ${vehicleTitle || 'Consultoria AS Auto Dreams'}.`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-md border transition-colors ${
            darkSurface
              ? 'border-zinc-700 text-white hover:bg-zinc-800'
              : 'border-zinc-300 text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-[#16A34A]" />
          <span>Ir direto ao WhatsApp</span>
        </a>
      </div>
    </form>
  );
}

import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { isSupabaseConfigured } from '../lib/supabase';
import { getCurrentAdmin, signInAdmin } from '../services/authService';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Acesso Administrativo | AS Auto Dreams';
    getCurrentAdmin()
      .then((user) => {
        if (user) {
          navigate('/admin', { replace: true });
        }
      })
      .finally(() => setCheckingSession(false));
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Informe e-mail e senha para acessar.');
      return;
    }

    setLoading(true);
    try {
      await signInAdmin(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível autenticar.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-[75vh] bg-[#08090C] flex items-center justify-center">
        <p className="text-sm text-zinc-400">Verificando sessão administrativa...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[82vh] bg-[#08090C] text-zinc-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#111319] border border-zinc-800 rounded-lg p-7 sm:p-9 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <img
            src={BRAND_CONFIG.logoPath}
            alt="AS Auto Dreams"
            className="h-16 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-bold text-white">Painel Administrativo</h1>
            <p className="text-xs text-zinc-400">
              Acesso exclusivo para gestão de veículos e interessados
            </p>
          </div>
        </div>

        {!isSupabaseConfigured && (
          <div className="p-3.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
            Ambiente local sem variáveis do Supabase configuradas. Consulte o{' '}
            <code className="font-mono text-amber-100">README.md</code> para conectar seu projeto Supabase em produção ou usar as credenciais de pré-visualização definidas no servidor.
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-md bg-red-500/10 border border-red-500/40 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-semibold text-zinc-300 mb-1.5">
              E-mail autorizado
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@asautodreams.com.br"
              className="w-full px-3.5 py-2.5 text-sm bg-[#090A0E] border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 outline-none focus:border-[#C9A227]"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Senha
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm bg-[#090A0E] border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 outline-none focus:border-[#C9A227]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-black bg-gradient-to-r from-[#E5C158] to-[#C9A227] rounded-md hover:brightness-110 transition-all disabled:opacity-60"
          >
            {loading ? <Lock className="w-4 h-4 animate-pulse" /> : <LogIn className="w-4 h-4" />}
            <span>{loading ? 'Entrando...' : 'Entrar no painel'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

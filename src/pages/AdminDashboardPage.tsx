import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car,
  CheckCircle2,
  Edit3,
  ExternalLink,
  LogOut,
  MessageCircle,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { AdminVehicleForm } from '../components/AdminVehicleForm';
import { getCurrentAdmin, signOutAdmin } from '../services/authService';
import { deleteLead, listLeads, toggleLeadContacted } from '../services/leadService';
import {
  createVehicle,
  deleteVehicle,
  listVehicles,
  updateVehicle,
} from '../services/vehicleService';
import type {
  AdminUser,
  DashboardStats,
  Lead,
  Vehicle,
  VehiclePayload,
  VehicleStatus,
} from '../types/database';
import {
  formatCurrencyBRL,
  formatDateBR,
  formatMileage,
  formatVehicleYear,
  sanitizePhoneDigits,
} from '../utils/formatters';

type AdminTab = 'vehicles' | 'leads';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<AdminTab>('vehicles');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [formMode, setFormMode] = useState<'closed' | 'create' | 'edit'>('closed');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [confirmDeleteVehicle, setConfirmDeleteVehicle] = useState<Vehicle | null>(null);

  const loadDashboard = async () => {
    setLoadingData(true);
    setError('');
    try {
      const [vehiclesData, leadsData] = await Promise.all([listVehicles(), listLeads()]);
      setVehicles(vehiclesData);
      setLeads(leadsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do painel.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    document.title = 'Painel Administrativo | AS Auto Dreams';
    getCurrentAdmin()
      .then((user) => {
        if (!user) {
          navigate('/admin/login', { replace: true });
          return;
        }
        setAdmin(user);
        loadDashboard();
      })
      .finally(() => setCheckingAuth(false));
  }, [navigate]);

  const stats: DashboardStats = useMemo(() => {
    return {
      totalVehicles: vehicles.length,
      availableVehicles: vehicles.filter((v) => v.status === 'disponivel').length,
      reservedVehicles: vehicles.filter((v) => v.status === 'reservado').length,
      soldVehicles: vehicles.filter((v) => v.status === 'vendido').length,
      totalLeads: leads.length,
    };
  }, [vehicles, leads]);

  const filteredVehicles = useMemo(() => {
    if (!statusFilter) return vehicles;
    return vehicles.filter((v) => v.status === statusFilter);
  }, [vehicles, statusFilter]);

  const handleLogout = async () => {
    await signOutAdmin();
    navigate('/admin/login', { replace: true });
  };

  const handleSaveVehicle = async (payload: VehiclePayload) => {
    if (formMode === 'edit' && editingVehicle) {
      const updated = await updateVehicle(editingVehicle.id, payload);
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    } else {
      const created = await createVehicle(payload);
      setVehicles((prev) => [created, ...prev]);
    }
    setFormMode('closed');
    setEditingVehicle(null);
  };

  const handleQuickStatusChange = async (vehicleId: string, newStatus: VehicleStatus) => {
    try {
      const updated = await updateVehicle(vehicleId, { status: newStatus });
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar situação do veículo.');
    }
  };

  const handleConfirmDeleteVehicle = async () => {
    if (!confirmDeleteVehicle) return;
    try {
      await deleteVehicle(confirmDeleteVehicle.id);
      setVehicles((prev) => prev.filter((v) => v.id !== confirmDeleteVehicle.id));
      setConfirmDeleteVehicle(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir veículo.');
    }
  };

  const handleToggleLeadContacted = async (lead: Lead) => {
    try {
      const next = !lead.contacted;
      await toggleLeadContacted(lead.id, next);
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, contacted: next } : l)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar lead.');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLead(leadId);
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover interessado.');
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-[75vh] bg-[#F8F8F9] flex items-center justify-center">
        <p className="text-sm text-zinc-600">Carregando painel administrativo...</p>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#F8F8F9] text-zinc-900 pb-16">
      {/* Barra superior do admin */}
      <section className="bg-[#0B0D12] text-white border-b border-zinc-800 py-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-[#D4AF37]">GESTÃO EXCLUSIVA</p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mt-0.5">
              Painel Administrativo
            </h1>
            <p className="text-xs text-zinc-400 mt-1">Conectado como {admin.email}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingVehicle(null);
                setFormMode('create');
                setActiveTab('vehicles');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-black bg-gradient-to-r from-[#E5C158] to-[#C9A227] rounded-md hover:brightness-110"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar veículo</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-200 border border-zinc-700 rounded-md hover:bg-zinc-800"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {error && (
          <div role="alert" className="p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Indicadores */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-4 sm:p-5">
            <p className="text-xs font-medium text-zinc-500">Total cadastrados</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 mt-1 tabular-nums">
              {stats.totalVehicles}
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg p-4 sm:p-5">
            <p className="text-xs font-medium text-emerald-700">Disponíveis</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-emerald-700 mt-1 tabular-nums">
              {stats.availableVehicles}
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg p-4 sm:p-5">
            <p className="text-xs font-medium text-amber-700">Reservados</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-amber-700 mt-1 tabular-nums">
              {stats.reservedVehicles}
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg p-4 sm:p-5">
            <p className="text-xs font-medium text-zinc-600">Vendidos</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-zinc-700 mt-1 tabular-nums">
              {stats.soldVehicles}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white border border-zinc-200 rounded-lg p-4 sm:p-5">
            <p className="text-xs font-medium text-[#9A7818]">Interessados recebidos</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 mt-1 tabular-nums">
              {stats.totalLeads}
            </p>
          </div>
        </div>

        {/* Formulário de Cadastro / Edição */}
        {formMode !== 'closed' ? (
          <AdminVehicleForm
            initialVehicle={editingVehicle}
            onCancel={() => {
              setFormMode('closed');
              setEditingVehicle(null);
            }}
            onSave={handleSaveVehicle}
          />
        ) : (
          <>
            {/* Navegação por abas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
              <div className="inline-flex p-1 bg-zinc-200/70 rounded-lg self-start">
                <button
                  type="button"
                  onClick={() => setActiveTab('vehicles')}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                    activeTab === 'vehicles'
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>Veículos ({vehicles.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('leads')}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                    activeTab === 'leads'
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Interessados ({leads.length})</span>
                </button>
              </div>

              {activeTab === 'vehicles' && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filtrar veículos por situação"
                  className="px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md text-zinc-800 outline-none focus:border-zinc-900"
                >
                  <option value="">Todas as situações</option>
                  <option value="disponivel">Somente disponíveis</option>
                  <option value="reservado">Somente reservados</option>
                  <option value="vendido">Somente vendidos</option>
                </select>
              )}
            </div>

            {loadingData ? (
              <div className="bg-white border border-zinc-200 rounded-lg p-10 text-center text-sm text-zinc-500">
                Carregando registros...
              </div>
            ) : activeTab === 'vehicles' ? (
              filteredVehicles.length === 0 ? (
                <div className="bg-white border border-zinc-200 rounded-lg p-10 text-center space-y-4">
                  <Car className="w-10 h-10 mx-auto text-zinc-400" />
                  <div className="space-y-1">
                    <h2 className="font-display text-lg font-semibold text-zinc-900">
                      Nenhum veículo cadastrado
                    </h2>
                    <p className="text-sm text-zinc-600">
                      Clique em “Cadastrar veículo” para adicionar o primeiro automóvel da vitrine.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingVehicle(null);
                      setFormMode('create');
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-black bg-gradient-to-r from-[#E5C158] to-[#C9A227] rounded-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cadastrar primeiro veículo</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="bg-white border border-zinc-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="w-24 h-18 rounded bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {vehicle.photos[0] ? (
                            <img
                              src={vehicle.photos[0]}
                              alt={vehicle.model}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Car className="w-6 h-6 text-zinc-400" />
                          )}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-display text-base font-bold text-zinc-950 truncate">
                              {vehicle.brand} {vehicle.model}
                            </h3>
                            {vehicle.featured && (
                              <span className="text-[11px] font-semibold text-[#9A7818]">
                                · Destaque
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-600 truncate">
                            {vehicle.version || vehicle.engine || 'Versão padrão'} ·{' '}
                            {formatVehicleYear(vehicle.manufacture_year, vehicle.model_year)} ·{' '}
                            <span className="tabular-nums">{formatMileage(vehicle.mileage)}</span>
                          </p>
                          <p className="text-sm font-bold text-zinc-900 tabular-nums">
                            {formatCurrencyBRL(vehicle.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 md:justify-end">
                        <select
                          value={vehicle.status}
                          onChange={(e) =>
                            handleQuickStatusChange(vehicle.id, e.target.value as VehicleStatus)
                          }
                          aria-label={`Alterar situação de ${vehicle.brand} ${vehicle.model}`}
                          className="px-3 py-2 text-xs font-semibold border border-zinc-300 rounded-md bg-white text-zinc-900 outline-none focus:border-zinc-900"
                        >
                          <option value="disponivel">Disponível</option>
                          <option value="reservado">Reservado</option>
                          <option value="vendido">Vendido</option>
                        </select>

                        <Link
                          to={`/veiculo/${vehicle.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-zinc-700 border border-zinc-300 rounded-md hover:bg-zinc-100"
                          title="Visualizar anúncio"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingVehicle(vehicle);
                            setFormMode('edit');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-zinc-900 border border-zinc-300 rounded-md hover:bg-zinc-100"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setConfirmDeleteVehicle(vehicle)}
                          className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-red-700 border border-red-200 rounded-md hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : leads.length === 0 ? (
              <div className="bg-white border border-zinc-200 rounded-lg p-10 text-center space-y-2">
                <Users className="w-10 h-10 mx-auto text-zinc-400" />
                <h2 className="font-display text-lg font-semibold text-zinc-900">
                  Nenhum interessado registrado ainda
                </h2>
                <p className="text-sm text-zinc-600">
                  Quando um cliente preencher o formulário de interesse em um veículo ou na consultoria, o contato aparecerá aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => {
                  const phoneDigits = sanitizePhoneDigits(lead.phone);
                  const clientWhatsApp = phoneDigits
                    ? `https://wa.me/${phoneDigits.startsWith('55') ? phoneDigits : `55${phoneDigits}`}?text=${encodeURIComponent(
                        `Olá ${lead.full_name}! Aqui é da AS Auto Dreams sobre seu interesse em: ${lead.vehicle_title}.`
                      )}`
                    : null;

                  return (
                    <div
                      key={lead.id}
                      className="bg-white border border-zinc-200 rounded-lg p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="font-display text-base font-bold text-zinc-950">
                            {lead.full_name}
                          </h3>
                          <span className="text-xs text-zinc-500 tabular-nums">
                            · {formatDateBR(lead.created_at)}
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              lead.contacted ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            · {lead.contacted ? 'Atendido' : 'Aguardando contato'}
                          </span>
                        </div>

                        <p className="text-sm font-medium text-zinc-800">
                          Interesse: <span className="font-semibold">{lead.vehicle_title}</span>
                        </p>
                        <p className="text-sm text-zinc-600 tabular-nums">
                          Telefone / WhatsApp: <span className="font-semibold">{lead.phone}</span>
                        </p>
                        {lead.message && (
                          <p className="text-sm text-zinc-600 bg-zinc-50 border border-zinc-200 rounded p-2.5 mt-1">
                            {lead.message}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        {clientWhatsApp && (
                          <a
                            href={clientWhatsApp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-md"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Chamar cliente</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleLeadContacted(lead)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-800 border border-zinc-300 rounded-md hover:bg-zinc-100"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{lead.contacted ? 'Marcar pendente' : 'Marcar atendido'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteLead(lead.id)}
                          aria-label="Excluir interessado"
                          className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-red-700 border border-red-200 rounded-md hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      {confirmDeleteVehicle && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-zinc-200 rounded-lg max-w-md w-full p-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-zinc-950">Confirmar exclusão</h3>
            <p className="text-sm text-zinc-600">
              Tem certeza que deseja excluir{' '}
              <strong>
                {confirmDeleteVehicle.brand} {confirmDeleteVehicle.model}
              </strong>
              ? Essa ação removerá o veículo da vitrine.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteVehicle(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 border border-zinc-300 rounded-md hover:bg-zinc-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteVehicle}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Excluir veículo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

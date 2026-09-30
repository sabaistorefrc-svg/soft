import React, { useState, useMemo } from 'react';
import { Demand, DemandStatus, DemandType } from '../types';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Eye,
  Plus
} from 'lucide-react';

interface DemandsTableProps {
  demands: Demand[];
  onSelectDemand: (demand: Demand) => void;
  onOpenCheckIn: (demand: Demand) => void;
  initialStatusFilter?: string;
}

export const DemandsTable: React.FC<DemandsTableProps> = ({
  demands,
  onSelectDemand,
  onOpenCheckIn,
  initialStatusFilter = 'all',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [tipoFilter, setTipoFilter] = useState('all');
  const [implantadorFilter, setImplantadorFilter] = useState('all');
  const [evolutionFilter, setEvolutionFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof Demand>('seq');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Extract unique implantadores & tipos
  const implantadoresList = useMemo(() => {
    const set = new Set<string>();
    demands.forEach(d => {
      if (d.implantador) set.add(d.implantador);
    });
    return Array.from(set).sort();
  }, [demands]);

  const tiposList = useMemo(() => {
    const set = new Set<string>();
    demands.forEach(d => {
      if (d.tipo) set.add(d.tipo);
    });
    return Array.from(set).sort();
  }, [demands]);

  // Filtered demands
  const filteredDemands = useMemo(() => {
    return demands.filter(d => {
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matches = 
          d.razaoSocial.toLowerCase().includes(query) ||
          d.clienteId.toLowerCase().includes(query) ||
          d.implantador.toLowerCase().includes(query) ||
          d.comercial.toLowerCase().includes(query) ||
          d.seq.toString().includes(query);
        if (!matches) return false;
      }

      // Status
      if (statusFilter !== 'all') {
        if (statusFilter === 'ongoing' && d.status !== 'Em Andamento') return false;
        if (statusFilter === 'overdue' && d.daysLate <= 0) return false;
        if (statusFilter === 'unassigned' && d.implantador !== 'Não Atribuído') return false;
        if (statusFilter === 'tep' && d.status !== 'Concluída (CS Finalizar TEP)') return false;
        if (statusFilter === 'completed' && d.status !== 'Concluída Geral') return false;
        if (statusFilter === 'stagnant' && (d.weeklyEvolutionState !== 'critico' && d.weeklyEvolutionState !== 'alerta')) return false;
        if (!['ongoing', 'overdue', 'unassigned', 'tep', 'completed', 'stagnant'].includes(statusFilter) && d.status !== statusFilter) {
          return false;
        }
      }

      // Tipo
      if (tipoFilter !== 'all' && d.tipo !== tipoFilter) return false;

      // Implantador
      if (implantadorFilter !== 'all' && d.implantador !== implantadorFilter) return false;

      // Evolution
      if (evolutionFilter !== 'all') {
        if (evolutionFilter === 'critico' && d.weeklyEvolutionState !== 'critico') return false;
        if (evolutionFilter === 'alerta' && d.weeklyEvolutionState !== 'alerta') return false;
        if (evolutionFilter === 'em_dia' && d.weeklyEvolutionState !== 'em_dia') return false;
      }

      return true;
    }).sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
    });
  }, [demands, searchTerm, statusFilter, tipoFilter, implantadorFilter, evolutionFilter, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(filteredDemands.length / pageSize) || 1;
  const paginatedDemands = filteredDemands.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: keyof Demand) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getStatusBadge = (status: DemandStatus) => {
    switch (status) {
      case 'Em Andamento':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">Em Andamento</span>;
      case 'Concluída Geral':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Concluída Geral</span>;
      case 'Concluída (CS Finalizar TEP)':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Pendente TEP / CS</span>;
      case 'Cancelada':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">Cancelada</span>;
      case 'Pausada':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">Pausada</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cliente ou seq..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Status: Todos</option>
              <option value="Em Andamento">Status: Em Andamento</option>
              <option value="stagnant">Sem Evolução Semanal</option>
              <option value="overdue">Atrasados (Vencidos)</option>
              <option value="unassigned">Sem Implantador</option>
              <option value="Concluída (CS Finalizar TEP)">Pendente TEP / CS</option>
              <option value="Concluída Geral">Concluídas</option>
              <option value="Cancelada">Canceladas</option>
              <option value="Pausada">Pausadas</option>
            </select>
          </div>

          {/* Evolution Filter */}
          <div>
            <select
              value={evolutionFilter}
              onChange={(e) => {
                setEvolutionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Evolução: Todas</option>
              <option value="critico">Crítico (&gt;14 dias parado)</option>
              <option value="alerta">Alerta (7 a 14 dias)</option>
              <option value="em_dia">Em Dia (&lt;7 dias)</option>
            </select>
          </div>

          {/* Tipo Filter */}
          <div>
            <select
              value={tipoFilter}
              onChange={(e) => {
                setTipoFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Tipo: Todos</option>
              {tiposList.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Implantador Filter */}
          <div>
            <select
              value={implantadorFilter}
              onChange={(e) => {
                setImplantadorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Implantador: Todos</option>
              {implantadoresList.map(imp => (
                <option key={imp} value={imp}>{imp}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter stats & Clear */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <span>
            Mostrando <strong>{filteredDemands.length}</strong> de <strong>{demands.length}</strong> demandas registradas
          </span>

          {(searchTerm || statusFilter !== 'all' || tipoFilter !== 'all' || implantadorFilter !== 'all' || evolutionFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTipoFilter('all');
                setImplantadorFilter('all');
                setEvolutionFilter('all');
                setCurrentPage(1);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
            >
              Limpar todos os filtros
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('seq')}>
                  <div className="flex items-center gap-1">
                    <span>Seq</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Cliente / Razão Social</th>
                <th className="py-3 px-4">Implantador</th>
                <th className="py-3 px-4">Comercial</th>
                <th className="py-3 px-4 text-center cursor-pointer hover:text-slate-200" onClick={() => handleSort('hrsNeg')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>Horas</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center cursor-pointer hover:text-slate-200" onClick={() => handleSort('totModulos')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>Módulos</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Cronograma</th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('daysSinceLastEvolution')}>
                  <div className="flex items-center gap-1">
                    <span>Evolução</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedDemands.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Nenhuma demanda encontrada para os filtros aplicados.
                  </td>
                </tr>
              ) : (
                paginatedDemands.map((demand) => {
                  const isStagnantCritical = demand.weeklyEvolutionState === 'critico';
                  const isStagnantAlert = demand.weeklyEvolutionState === 'alerta';

                  return (
                    <tr 
                      key={demand.seq}
                      className="hover:bg-slate-850/50 transition-colors group cursor-pointer"
                      onClick={() => onSelectDemand(demand)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-300">
                        #{demand.seq}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {demand.razaoSocial}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span className="font-mono">ID: {demand.clienteId}</span>
                          <span>•</span>
                          <span>{demand.tipo}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${
                          demand.implantador === 'Não Atribuído' 
                            ? 'text-rose-400 font-bold' 
                            : 'text-slate-300'
                        }`}>
                          {demand.implantador}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">
                        {demand.comercial}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-200">
                        {demand.hrsNeg}h
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-200">
                        {demand.totModulos}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-400">
                        <div>{demand.prevInicio} → {demand.prevFim}</div>
                        {demand.daysLate > 0 && (
                          <div className="text-rose-400 font-bold text-[10px]">
                            +{demand.daysLate}d atrasado
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {demand.status === 'Em Andamento' ? (
                          <div className={`
                            inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono
                            ${isStagnantCritical ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                              isStagnantAlert ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}
                          `}>
                            <Clock className="w-3 h-3" />
                            <span>{demand.daysSinceLastEvolution}d parado</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-mono">
                            {demand.conclusao ? demand.conclusao : '—'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(demand.status)}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {demand.status === 'Em Andamento' && (
                            <button
                              onClick={() => onOpenCheckIn(demand)}
                              className="p-1 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors"
                              title="Registrar Check-In Semanal"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onSelectDemand(demand)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Página <strong className="text-slate-200">{currentPage}</strong> de <strong className="text-slate-200">{totalPages}</strong>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

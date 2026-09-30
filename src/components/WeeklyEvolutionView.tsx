import React, { useState } from 'react';
import { Demand } from '../types';
import { 
  AlertTriangle, 
  Clock, 
  Calendar, 
  User, 
  CheckCircle2, 
  Flame, 
  FileWarning, 
  ArrowRight,
  Filter,
  PlusCircle,
  Tag
} from 'lucide-react';

interface WeeklyEvolutionViewProps {
  demands: Demand[];
  onSelectDemand: (demand: Demand) => void;
  onOpenCheckIn: (demand: Demand) => void;
}

export const WeeklyEvolutionView: React.FC<WeeklyEvolutionViewProps> = ({
  demands,
  onSelectDemand,
  onOpenCheckIn,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'critico' | 'alerta' | 'unassigned'>('all');

  // Filter only ongoing demands that have no weekly evolution
  const stagnantDemands = demands.filter(d => 
    d.status === 'Em Andamento' && 
    (d.weeklyEvolutionState === 'critico' || d.weeklyEvolutionState === 'alerta')
  );

  const displayedDemands = stagnantDemands.filter(d => {
    if (filterType === 'critico') return d.weeklyEvolutionState === 'critico';
    if (filterType === 'alerta') return d.weeklyEvolutionState === 'alerta';
    if (filterType === 'unassigned') return d.implantador === 'Não Atribuído' || !d.implantador;
    return true;
  }).sort((a, b) => b.daysSinceLastEvolution - a.daysSinceLastEvolution);

  const criticalCount = stagnantDemands.filter(d => d.weeklyEvolutionState === 'critico').length;
  const alertCount = stagnantDemands.filter(d => d.weeklyEvolutionState === 'alerta').length;
  const unassignedCount = stagnantDemands.filter(d => d.implantador === 'Não Atribuído' || !d.implantador).length;

  return (
    <div className="space-y-6">
      {/* Alert Header Box */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/30 border border-rose-900/60 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-rose-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm mb-1 uppercase tracking-wider">
              <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
              <span>Painel de Estagnação Operacional</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-100">
              Demandas em Andamento Sem Evolução Semanal
            </h3>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              Pelo SLA de implantação, cada cliente deve receber no mínimo um avanço ou alinhamento a cada 7 dias. Abaixo estão listadas as demandas que violaram este ciclo.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-lg bg-rose-900/40 border border-rose-800/80 text-center">
              <span className="block text-2xl font-black font-mono text-rose-300">
                {stagnantDemands.length}
              </span>
              <span className="text-[10px] text-rose-400 uppercase font-semibold">
                Estagnadas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todas Sem Evolução ({stagnantDemands.length})
          </button>
          <button
            onClick={() => setFilterType('critico')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'critico'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Crítico (&gt;14 dias) ({criticalCount})
          </button>
          <button
            onClick={() => setFilterType('alerta')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'alerta'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Alerta (7 a 14 dias) ({alertCount})
          </button>
          <button
            onClick={() => setFilterType('unassigned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'unassigned'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Sem Implantador ({unassignedCount})
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Exibindo {displayedDemands.length} demandas prioritárias
        </div>
      </div>

      {/* Stagnant Demands Grid */}
      {displayedDemands.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-slate-900/50 border border-slate-800">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-200">
            Nenhuma demanda neste filtro de estagnação!
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Todas as demandas selecionadas tiveram acompanhamentos semanais recentes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayedDemands.map((demand) => {
            const isCritical = demand.weeklyEvolutionState === 'critico';
            return (
              <div
                key={demand.seq}
                className={`
                  p-4 rounded-xl bg-slate-900/90 border transition-all duration-200 flex flex-col justify-between
                  ${isCritical ? 'border-rose-900/80 hover:border-rose-600/80 shadow-rose-950/20' : 'border-amber-900/60 hover:border-amber-600/60'}
                  shadow-md hover:shadow-lg
                `}
              >
                <div>
                  {/* Top Bar: Seq & Days without evolution */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        #{demand.seq}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Cód: {demand.clienteId}
                      </span>
                    </div>

                    <div className={`
                      flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold
                      ${isCritical 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}
                    `}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{demand.daysSinceLastEvolution} dias sem evolução</span>
                    </div>
                  </div>

                  {/* Client title & Company */}
                  <div className="mb-3">
                    <h4 className="text-sm font-bold text-slate-100 line-clamp-1 hover:text-indigo-400 cursor-pointer" onClick={() => onSelectDemand(demand)}>
                      {demand.razaoSocial}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        {demand.tipo}
                      </span>
                      <span>Comercial: <strong className="text-slate-300">{demand.comercial}</strong></span>
                    </div>
                  </div>

                  {/* Key Metrics Pill Grid */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-center mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Horas</span>
                      <span className="text-xs font-mono font-bold text-slate-200">{demand.hrsNeg}h</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Módulos</span>
                      <span className="text-xs font-mono font-bold text-slate-200">{demand.totModulos}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Pessoas</span>
                      <span className="text-xs font-mono font-bold text-slate-200">{demand.pessoasTreinar}</span>
                    </div>
                  </div>

                  {/* Responsible & Dates */}
                  <div className="space-y-1.5 text-xs text-slate-300 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Implantador:
                      </span>
                      <span className={`font-medium ${demand.implantador === 'Não Atribuído' ? 'text-rose-400 font-bold' : 'text-slate-200'}`}>
                        {demand.implantador}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Cronograma:
                      </span>
                      <span className="font-mono text-[11px] text-slate-300">
                        {demand.prevInicio} → {demand.prevFim}
                      </span>
                    </div>

                    {demand.daysLate > 0 && (
                      <div className="flex items-center justify-between text-amber-400 font-semibold">
                        <span>Atraso na Conclusão:</span>
                        <span className="font-mono">{demand.daysLate} dias de atraso</span>
                      </div>
                    )}
                  </div>

                  {/* Bottleneck Alert Tag */}
                  {demand.bottlenecks.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-xs text-rose-300 mb-4 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[11px] text-rose-400">
                        <FileWarning className="w-3.5 h-3.5 shrink-0" />
                        <span>Diagnóstico do Gargalo:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-300">
                        {demand.bottlenecks[0]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenCheckIn(demand)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Registrar Check-In</span>
                  </button>

                  <button
                    onClick={() => onSelectDemand(demand)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Ver detalhes completos"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

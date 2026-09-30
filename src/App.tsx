import React, { useState, useEffect, useMemo } from 'react';
import { RAW_CSV_DATA } from './data/rawCsv';
import { parseCsvData } from './utils/parser';
import { Demand } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { WeeklyEvolutionView } from './components/WeeklyEvolutionView';
import { BottleneckStagesView } from './components/BottleneckStagesView';
import { DemandsTable } from './components/DemandsTable';
import { WorkloadView } from './components/WorkloadView';
import { DemandDetailModal } from './components/DemandDetailModal';
import { WeeklyEvolutionTrendChart } from './components/WeeklyEvolutionTrendChart';
import { WeeklyTrendAlert } from './components/WeeklyTrendAlert';
import { 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Filter, 
  Flame, 
  Sparkles,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

export default function App() {
  const [demands, setDemands] = useState<Demand[]>(() => {
    const saved = localStorage.getItem('implantacao_demands_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved demands', e);
      }
    }
    return parseCsvData(RAW_CSV_DATA);
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const [statusFilterPreset, setStatusFilterPreset] = useState<string>('all');

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('implantacao_demands_v1', JSON.stringify(demands));
  }, [demands]);

  // Available unique implantadores
  const availableImplantadores = useMemo(() => {
    const set = new Set<string>();
    demands.forEach(d => {
      if (d.implantador) set.add(d.implantador);
    });
    return Array.from(set).sort();
  }, [demands]);

  // Aggregate high-level metrics
  const metrics = useMemo(() => {
    const total = demands.length;
    const ongoingDemands = demands.filter(d => d.status === 'Em Andamento');
    const ongoing = ongoingDemands.length;

    const stagnantCritical = ongoingDemands.filter(d => d.weeklyEvolutionState === 'critico').length;
    const stagnantAlert = ongoingDemands.filter(d => d.weeklyEvolutionState === 'alerta').length;
    const stagnantCount = stagnantCritical + stagnantAlert;

    const overdue = ongoingDemands.filter(d => d.daysLate > 0).length;
    const unassigned = ongoingDemands.filter(d => !d.implantador || d.implantador === 'Não Atribuído').length;
    const tepPending = demands.filter(d => d.status === 'Concluída (CS Finalizar TEP)').length;
    const completed = demands.filter(d => d.status === 'Concluída Geral').length;

    const totalDaysOpen = ongoingDemands.reduce((acc, curr) => acc + (curr.daysOpen || 0), 0);
    const avgDaysOpenOngoing = ongoing > 0 ? Math.round(totalDaysOpen / ongoing) : 0;

    return {
      total,
      ongoing,
      totalOngoing: ongoing,
      stagnantCount,
      stagnantCritical,
      stagnantAlert,
      overdue,
      unassigned,
      unassignedCount: unassigned,
      tepPending,
      tepPendingCount: tepPending,
      completed,
      avgDaysOpenOngoing,
      bottleneckCount: unassigned + overdue + tepPending,
    };
  }, [demands]);

  // Handle demand update
  const handleSaveDemand = (updated: Demand) => {
    setDemands(prev => prev.map(d => d.seq === updated.seq ? updated : d));
    setSelectedDemand(updated);
  };

  // Handle reset data
  const handleRefresh = () => {
    if (confirm('Deseja recarregar a base de dados original? Todas as edições manuais serão redefinidas.')) {
      localStorage.removeItem('implantacao_demands_v1');
      setDemands(parseCsvData(RAW_CSV_DATA));
    }
  };

  // Handle export CSV
  const handleExport = () => {
    const headers = [
      'Seq',
      'Prev. Início',
      'Prev. Fim',
      'Implantador',
      'Cliente ID',
      'Razão Social',
      'Comercial',
      'Horas Negociadas',
      'Pessoas a Treinar',
      'Módulos',
      'Status',
      'Dias Sem Evolução',
      'Gargalo Identificado'
    ];

    const rows = demands.map(d => [
      d.seq,
      d.prevInicio,
      d.prevFim,
      d.implantador,
      d.clienteId,
      `"${d.razaoSocial.replace(/"/g, '""')}"`,
      d.comercial,
      d.hrsNeg,
      d.pessoasTreinar,
      d.totModulos,
      d.status,
      d.daysSinceLastEvolution,
      `"${(d.bottlenecks[0] || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `implantacoes_gargalos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick filter jump from KPI
  const handleKpiFilterJump = (kpiId: string) => {
    if (kpiId === 'stagnant') {
      setActiveTab('stagnant');
    } else if (kpiId === 'unassigned') {
      setActiveTab('bottlenecks');
    } else if (kpiId === 'tepPending') {
      setActiveTab('bottlenecks');
    } else {
      setStatusFilterPreset(kpiId);
      setActiveTab('table');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metrics={metrics}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Header */}
        <Header
          onMenuClick={() => setIsMobileOpen(true)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onRefresh={handleRefresh}
          onExport={handleExport}
          stagnantCount={metrics.stagnantCount}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Global Search result notification if search is active */}
          {searchTerm && (
            <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/80 flex items-center justify-between text-xs text-indigo-300">
              <span>Filtro de busca ativa: <strong>"{searchTerm}"</strong></span>
              <button 
                onClick={() => setSearchTerm('')}
                className="underline text-indigo-200 hover:text-white"
              >
                Limpar busca
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW & KPIS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive KPI Cards */}
              <KpiCards metrics={metrics} onSelectFilter={handleKpiFilterJump} />

              {/* Weekly Trend Alert (Week-over-Week Percentage Indicator) */}
              <WeeklyTrendAlert 
                demands={demands} 
                onViewStagnant={() => setActiveTab('stagnant')} 
              />

              {/* Weekly Evolution Trend Chart (Last 4 Weeks) */}
              <WeeklyEvolutionTrendChart demands={demands} />

              {/* Main Urgent Callout for Stagnant Demands */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/50 via-slate-900 to-indigo-950/40 border border-rose-900/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                    <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                    <span>Prioridade Máxima da Semana</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">
                    {metrics.stagnantCount} demandas ativas precisam de evolução imediata
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    Identificamos <strong>{metrics.stagnantCritical} demandas críticas (&gt;14 dias sem avanço)</strong> e <strong>{metrics.stagnantAlert} em alerta (&gt;7 dias)</strong>. Acesse a lista para registrar check-in ou remover bloqueios.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('stagnant')}
                  className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 shrink-0"
                >
                  <span>Ver Demandas Estagnadas</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Process Bottlenecks Funnel Quick-Preview */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                      Gargalos Operacionais Identificados por Etapa
                    </h3>
                    <p className="text-xs text-slate-400">
                      Onde as demandas estão parando antes de atingirem a conclusão
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('bottlenecks')}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>Abrir funil detalhado</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div 
                    onClick={() => setActiveTab('bottlenecks')}
                    className="p-4 rounded-xl bg-slate-950/60 border border-purple-900/40 hover:border-purple-600 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-purple-400">1. Alocação (Kickoff)</span>
                      <span className="font-mono font-bold text-slate-200">{metrics.unassigned}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Demandas abertas sem implantador definido na planilha.
                    </p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('bottlenecks')}
                    className="p-4 rounded-xl bg-slate-950/60 border border-rose-900/40 hover:border-rose-600 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-rose-400">4. Go-Live (Homologação)</span>
                      <span className="font-mono font-bold text-slate-200">{metrics.overdue}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Projetos com prazo previsto expirado e entrega pendente.
                    </p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('bottlenecks')}
                    className="p-4 rounded-xl bg-slate-950/60 border border-emerald-900/40 hover:border-emerald-600 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-emerald-400">5. Validação TEP (CS)</span>
                      <span className="font-mono font-bold text-slate-200">{metrics.tepPending}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Treinamento concluído, aguardando aceite formal do CS.
                    </p>
                  </div>
                </div>
              </div>

              {/* Top 5 Critical Demands Table in Overview */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-rose-400" />
                    Top Casos de Maior Estagnação (Ação Imediata)
                  </h3>
                  <button
                    onClick={() => setActiveTab('stagnant')}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    Ver todas ({metrics.stagnantCount})
                  </button>
                </div>

                <div className="space-y-2">
                  {demands
                    .filter(d => d.status === 'Em Andamento')
                    .sort((a, b) => b.daysSinceLastEvolution - a.daysSinceLastEvolution)
                    .slice(0, 5)
                    .map((d) => (
                      <div
                        key={d.seq}
                        onClick={() => setSelectedDemand(d)}
                        className="p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-indigo-400">#{d.seq}</span>
                            <span className="font-semibold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors">
                              {d.razaoSocial}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              {d.tipo}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            Implantador: <strong className="text-slate-300">{d.implantador}</strong> • Comercial: <strong className="text-slate-300">{d.comercial}</strong> • Horas: <strong className="text-slate-300">{d.hrsNeg}h</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <div className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {d.daysSinceLastEvolution} dias sem evolução
                          </div>
                          <div className="p-1 rounded bg-slate-800 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white transition-colors">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STAGNANT DEMANDS (SEM EVOLUÇÃO SEMANAL) */}
          {activeTab === 'stagnant' && (
            <WeeklyEvolutionView
              demands={demands}
              onSelectDemand={setSelectedDemand}
              onOpenCheckIn={setSelectedDemand}
            />
          )}

          {/* TAB 3: BOTTLENECKS BY PROCESS STAGE */}
          {activeTab === 'bottlenecks' && (
            <BottleneckStagesView
              demands={demands}
              onSelectDemand={setSelectedDemand}
            />
          )}

          {/* TAB 4: FULL DEMANDS TABLE */}
          {activeTab === 'table' && (
            <DemandsTable
              demands={demands}
              onSelectDemand={setSelectedDemand}
              onOpenCheckIn={setSelectedDemand}
              initialStatusFilter={statusFilterPreset}
            />
          )}

          {/* TAB 5: WORKLOAD BY IMPLANTADOR */}
          {activeTab === 'team' && (
            <WorkloadView demands={demands} />
          )}
        </main>
      </div>

      {/* Demand Detail / Check-In Modal */}
      {selectedDemand && (
        <DemandDetailModal
          demand={selectedDemand}
          onClose={() => setSelectedDemand(null)}
          onSaveDemand={handleSaveDemand}
          availableImplantadores={availableImplantadores}
        />
      )}
    </div>
  );
}

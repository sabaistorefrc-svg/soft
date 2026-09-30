import React from 'react';
import { Demand } from '../types';
import { Users, AlertTriangle, CheckCircle, Clock, Briefcase, BarChart2 } from 'lucide-react';

interface WorkloadViewProps {
  demands: Demand[];
  onSelectImplantador?: (implantador: string) => void;
}

export const WorkloadView: React.FC<WorkloadViewProps> = ({ demands, onSelectImplantador }) => {
  // Aggregate by implantador
  const implantadorStats = React.useMemo(() => {
    const map = new Map<string, {
      total: number;
      ongoing: number;
      stagnant: number;
      completed: number;
      canceled: number;
      totalHours: number;
      totalModules: number;
    }>();

    demands.forEach(d => {
      const name = d.implantador || 'Não Atribuído';
      if (!map.has(name)) {
        map.set(name, {
          total: 0,
          ongoing: 0,
          stagnant: 0,
          completed: 0,
          canceled: 0,
          totalHours: 0,
          totalModules: 0,
        });
      }
      const item = map.get(name)!;
      item.total += 1;
      item.totalHours += d.hrsNeg || 0;
      item.totalModules += d.totModulos || 0;

      if (d.status === 'Em Andamento') {
        item.ongoing += 1;
        if (d.weeklyEvolutionState === 'critico' || d.weeklyEvolutionState === 'alerta') {
          item.stagnant += 1;
        }
      } else if (d.status === 'Concluída Geral' || d.status === 'Concluída (CS Finalizar TEP)') {
        item.completed += 1;
      } else if (d.status === 'Cancelada') {
        item.canceled += 1;
      }
    });

    return Array.from(map.entries()).map(([name, stats]) => ({
      name,
      ...stats,
      stagnationRate: stats.ongoing > 0 ? Math.round((stats.stagnant / stats.ongoing) * 100) : 0,
    })).sort((a, b) => b.ongoing - a.ongoing);
  }, [demands]);

  // Aggregate by comercial
  const comercialStats = React.useMemo(() => {
    const map = new Map<string, { total: number; ongoing: number; canceled: number }>();
    demands.forEach(d => {
      const name = d.comercial || 'Indefinido';
      if (!map.has(name)) {
        map.set(name, { total: 0, ongoing: 0, canceled: 0 });
      }
      const item = map.get(name)!;
      item.total += 1;
      if (d.status === 'Em Andamento') item.ongoing += 1;
      if (d.status === 'Cancelada') item.canceled += 1;
    });

    return Array.from(map.entries())
      .map(([name, s]) => ({ name, ...s }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [demands]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          Distribuição de Carga Operacional & Gargalos de Equipe
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Análise de alocação de carteira ativa, volume de horas sob responsabilidade e taxa de estagnação por profissional.
        </p>
      </div>

      {/* Implantador Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {implantadorStats.map((imp) => {
          const isUnassigned = imp.name === 'Não Atribuído';
          return (
            <div
              key={imp.name}
              className={`
                p-5 rounded-xl bg-slate-900 border transition-all duration-200
                ${isUnassigned ? 'border-rose-900/60 bg-rose-950/10' : 'border-slate-800 hover:border-slate-700'}
              `}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${isUnassigned ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">{imp.name}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {imp.total} demandas no histórico
                    </span>
                  </div>
                </div>

                {isUnassigned && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    Aguardando Alocação
                  </span>
                )}
              </div>

              {/* Numbers Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-center mb-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Em Andamento</span>
                  <span className="text-base font-bold font-mono text-blue-400">{imp.ongoing}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sem Evolução</span>
                  <span className={`text-base font-bold font-mono ${imp.stagnant > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {imp.stagnant}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Concluídas</span>
                  <span className="text-base font-bold font-mono text-emerald-400">{imp.completed}</span>
                </div>
              </div>

              {/* Stagnation Progress Bar */}
              {imp.ongoing > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Taxa de Estagnação Semanal:</span>
                    <span className={`font-mono font-bold ${imp.stagnationRate > 50 ? 'text-rose-400' : 'text-amber-400'}`}>
                      {imp.stagnationRate}% ({imp.stagnant}/{imp.ongoing})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${imp.stagnationRate > 50 ? 'bg-rose-500' : 'bg-amber-500'}`}
                      style={{ width: `${imp.stagnationRate}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Commercial breakdown */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-indigo-400" />
          Origem Comercial das Demandas
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {comercialStats.map((com) => (
            <div key={com.name} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-xs font-semibold text-slate-200 block truncate">{com.name}</span>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-2 font-mono">
                <span>Total: <strong className="text-slate-200">{com.total}</strong></span>
                <span>Ativas: <strong className="text-blue-400">{com.ongoing}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

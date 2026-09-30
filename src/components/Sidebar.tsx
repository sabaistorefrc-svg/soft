import React from 'react';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  GitCommit, 
  Table, 
  Users, 
  Flame,
  FileSpreadsheet,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  metrics: {
    totalOngoing: number;
    stagnantCount: number;
    bottleneckCount: number;
    unassignedCount: number;
    tepPendingCount: number;
  };
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  metrics,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const menuItems = [
    {
      id: 'overview',
      label: 'Visão Geral & KPIs',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'stagnant',
      label: 'Sem Evolução Semanal',
      icon: AlertTriangle,
      badge: metrics.stagnantCount,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    },
    {
      id: 'bottlenecks',
      label: 'Gargalos por Etapa',
      icon: GitCommit,
      badge: metrics.bottleneckCount,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    {
      id: 'table',
      label: 'Demandas & Projetos',
      icon: Table,
      badge: metrics.totalOngoing,
      badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    },
    {
      id: 'team',
      label: 'Carga por Implantador',
      icon: Users,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out
        lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 tracking-tight text-base leading-snug">
                Implantação 360°
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Painel Ativo
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stagnation Alert Banner */}
        <div className="mx-3 mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300">
          <div className="flex items-center gap-2 font-semibold text-rose-200 mb-1">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Alerta de Estagnação</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            <strong className="text-rose-400 font-bold">{metrics.stagnantCount}</strong> demandas em andamento estão sem evolução há mais de 7 dias.
          </p>
        </div>

        {/* Nav list */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Navegação Principal
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom stats summary */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50 space-y-2">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Sem Implantador
            </span>
            <span className="font-mono text-amber-400 font-bold">{metrics.unassignedCount}</span>
          </div>
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              Pendente TEP / CS
            </span>
            <span className="font-mono text-indigo-400 font-bold">{metrics.tepPendingCount}</span>
          </div>
          <div className="pt-2 text-[10px] text-slate-400 text-center border-t border-slate-800/60 font-mono">
            Data Base: 30/09/2026
          </div>
        </div>
      </aside>
    </>
  );
};

import React from 'react';
import { 
  Menu, 
  Search, 
  RefreshCw, 
  Download, 
  AlertCircle,
  Calendar,
  Layers
} from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  stagnantCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  searchTerm,
  onSearchChange,
  onRefresh,
  onExport,
  stagnantCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Mobile menu trigger & title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 lg:hidden focus:outline-none"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              Controle de Implantações & Gargalos
            </h2>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              v2.4
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Monitoramento em tempo real de demandas sem avanço semanal e gargalos operacionais
          </p>
        </div>
      </div>

      {/* Center Search */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, razão social, implantador ou seq..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date Reference Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 font-mono">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Corte: 30/09/2026</span>
        </div>

        {/* Action: Export CSV */}
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors shadow-xs"
          title="Exportar dados filtrados em CSV"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Exportar</span>
        </button>

        {/* Action: Reload */}
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          title="Recarregar dados originais"
        >
          <RefreshCw className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </header>
  );
};

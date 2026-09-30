import React, { useState } from 'react';
import { Demand, DemandStatus, ProcessStage } from '../types';
import { 
  X, 
  Calendar, 
  User, 
  Building, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Save, 
  FileText,
  Layers,
  ArrowRight
} from 'lucide-react';

interface DemandDetailModalProps {
  demand: Demand | null;
  onClose: () => void;
  onSaveDemand: (updated: Demand) => void;
  availableImplantadores: string[];
}

export const DemandDetailModal: React.FC<DemandDetailModalProps> = ({
  demand,
  onClose,
  onSaveDemand,
  availableImplantadores,
}) => {
  if (!demand) return null;

  const [implantador, setImplantador] = useState(demand.implantador || 'Não Atribuído');
  const [status, setStatus] = useState<DemandStatus>(demand.status);
  const [stage, setStage] = useState<ProcessStage>(demand.currentStage);
  const [progress, setProgress] = useState(demand.progressPercent);
  
  // Check-In Form
  const [checkInNote, setCheckInNote] = useState('');
  const [checkInBlocker, setCheckInBlocker] = useState('');

  const handleAddCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInNote.trim()) return;

    const newCheckIn = {
      date: new Date().toLocaleDateString('pt-BR'),
      note: checkInNote.trim(),
      progressPercent: progress,
      stage,
      blocker: checkInBlocker.trim() || undefined
    };

    const updated: Demand = {
      ...demand,
      implantador,
      status,
      currentStage: stage,
      progressPercent: progress,
      daysSinceLastEvolution: 0,
      weeklyEvolutionState: 'em_dia',
      bottlenecks: checkInBlocker ? [checkInBlocker] : [],
      checkIns: [newCheckIn, ...(demand.checkIns || [])]
    };

    onSaveDemand(updated);
    setCheckInNote('');
    setCheckInBlocker('');
  };

  const handleGeneralSave = () => {
    const updated: Demand = {
      ...demand,
      implantador,
      status,
      currentStage: stage,
      progressPercent: progress,
    };
    onSaveDemand(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              #{demand.seq}
            </span>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-100 line-clamp-1">
                {demand.razaoSocial}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Cód: {demand.clienteId} • Comercial: {demand.comercial}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Key Indicators bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Horas Negociadas</span>
              <span className="text-base font-bold font-mono text-slate-100">{demand.hrsNeg}h</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Módulos</span>
              <span className="text-base font-bold font-mono text-slate-100">{demand.totModulos}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pessoas p/ Treinar</span>
              <span className="text-base font-bold font-mono text-slate-100">{demand.pessoasTreinar}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Última Evolução</span>
              <span className={`text-base font-bold font-mono ${
                demand.daysSinceLastEvolution > 7 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {demand.daysSinceLastEvolution}d atrás
              </span>
            </div>
          </div>

          {/* Form Controls: Implantador, Status, Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Implantador Responsável
              </label>
              <select
                value={implantador}
                onChange={(e) => setImplantador(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Não Atribuído">-- Não Atribuído --</option>
                {availableImplantadores.filter(i => i !== 'Não Atribuído').map((imp) => (
                  <option key={imp} value={imp}>{imp}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status da Demanda
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DemandStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluída (CS Finalizar TEP)">Pendente TEP / CS</option>
                <option value="Concluída Geral">Concluída Geral</option>
                <option value="Pausada">Pausada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Etapa do Processo
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as ProcessStage)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="kickoff">1. Kickoff & Alocação</option>
                <option value="parametrizacao">2. Parametrização & Escopo</option>
                <option value="treinamento">3. Treinamento de Usuários</option>
                <option value="homologacao">4. Homologação / Go-Live</option>
                <option value="tep_cs">5. Finalização TEP (CS)</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>
          </div>

          {/* Progress Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span>Progresso Estimado da Implantação:</span>
              <span className="font-mono text-indigo-400">{progress}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* New Check-In Registration Box */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Registrar Nova Evolução Semanal (Check-In)</span>
            </h4>
            <p className="text-xs text-slate-400">
              Registrar uma anotação aqui reinicia o contador de estagnação semanal da demanda para 0 dias.
            </p>

            <form onSubmit={handleAddCheckIn} className="space-y-3">
              <div>
                <textarea
                  placeholder="Descreva a evolução desta semana (ex: parametrizado módulo de estoque, realizado alinhamento com financeiro)..."
                  value={checkInNote}
                  onChange={(e) => setCheckInNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 h-20"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Existe algum gargalo ou impedimento? (opcional)"
                  value={checkInBlocker}
                  onChange={(e) => setCheckInBlocker(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={!checkInNote.trim()}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Evolução Semanal</span>
              </button>
            </form>
          </div>

          {/* Historical Check-Ins */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>Histórico de Acompanhamentos</span>
            </h4>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {demand.checkIns && demand.checkIns.length > 0 ? (
                demand.checkIns.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                      <span>{item.date}</span>
                      <span className="capitalize text-indigo-400 font-semibold">{item.stage} • {item.progressPercent}%</span>
                    </div>
                    <p className="text-slate-200">{item.note}</p>
                    {item.blocker && (
                      <span className="inline-block text-[11px] text-rose-400 font-medium">
                        ⚠️ Gargalo: {item.blocker}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic p-3 text-center">
                  Nenhum check-in registrado anteriormente.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGeneralSave}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Alterações Gerais</span>
          </button>
        </div>
      </div>
    </div>
  );
};

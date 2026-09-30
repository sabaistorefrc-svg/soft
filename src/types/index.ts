export type DemandStatus = 
  | 'Em Andamento' 
  | 'Concluída Geral' 
  | 'Concluída (CS Finalizar TEP)' 
  | 'Cancelada' 
  | 'Pausada'
  | 'Sem Status';

export type DemandType = 
  | 'Nova Implantação' 
  | 'UpSell - Novos Módulos' 
  | 'Acompanhamento Treinamento' 
  | 'Acompanhamento Insatisfação' 
  | 'Outros';

export type ProcessStage = 
  | 'kickoff'
  | 'parametrizacao'
  | 'treinamento'
  | 'homologacao'
  | 'tep_cs'
  | 'concluido'
  | 'pausado_cancelado';

export interface WeeklyCheckIn {
  date: string;
  note: string;
  progressPercent: number;
  stage: ProcessStage;
  blocker?: string;
}

export interface Demand {
  seq: number;
  prevInicio: string; // DD/MM/YY
  prevFim: string; // DD/MM/YY
  implantador: string;
  clienteId: string;
  razaoSocial: string;
  comercial: string;
  hrsNeg: number;
  pessoasTreinar: number;
  totModulos: number;
  conclusao: string; // DD/MM/YY or ''
  status: DemandStatus;
  tipo: DemandType;
  
  // Computed & Interactive Fields
  startDate?: Date;
  endDate?: Date;
  completionDate?: Date;
  daysOpen: number;
  daysLate: number; // >0 if overdue
  daysSinceLastEvolution: number;
  weeklyEvolutionState: 'critico' | 'alerta' | 'em_dia' | 'concluido' | 'inativo';
  currentStage: ProcessStage;
  progressPercent: number;
  bottlenecks: string[];
  checkIns: WeeklyCheckIn[];
  notes?: string;
}

export interface BottleneckMetric {
  title: string;
  stage: ProcessStage;
  severity: 'alta' | 'media' | 'baixa';
  affectedCount: number;
  description: string;
  rootCause: string;
  recommendation: string;
}

export interface FilterState {
  search: string;
  status: string;
  tipo: string;
  responsavel: string;
  weeklyEvolution: 'all' | 'critico' | 'alerta' | 'em_dia' | 'atrasado';
  moduloRange: 'all' | '1-2' | '3-5' | '6-10' | '10+';
  sortBy: 'seq' | 'daysOpen' | 'daysLate' | 'daysSinceLastEvolution' | 'modulos' | 'hrsNeg';
  sortOrder: 'asc' | 'desc';
}

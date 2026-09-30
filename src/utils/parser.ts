import { Demand, DemandStatus, DemandType, ProcessStage } from '../types';

export function parseDate(dateStr: string): Date | undefined {
  if (!dateStr || dateStr.trim() === '') return undefined;
  const parts = dateStr.trim().split('/');
  if (parts.length !== 3) return undefined;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  let year = parseInt(parts[2], 10);
  if (year < 100) {
    year += 2000;
  }
  return new Date(year, month, day);
}

// Current reference date for analysis is September 30, 2026 (matching dataset timeframe)
export const REFERENCE_DATE = new Date(2026, 8, 30); // 30/09/2026

export function calculateDaysBetween(start: Date, end: Date): number {
  const diffTime = end.getTime() - start.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function parseCsvData(csvText: string): Demand[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const demands: Demand[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split by comma while respecting quoted cells if any
    const cols: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cols.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cols.push(current.trim());

    if (cols.length < 12) continue;

    const seq = parseInt(cols[0], 10);
    if (isNaN(seq)) continue;

    const prevInicioStr = cols[1] || '';
    const prevFimStr = cols[2] || '';
    const implantador = cols[3]?.trim() || '';
    const clienteId = cols[4]?.trim() || '';
    const razaoSocial = cols[5]?.trim() || '';
    const comercial = cols[6]?.trim() || '';
    const hrsNeg = parseFloat(cols[7]) || 0;
    const pessoasTreinar = parseInt(cols[8], 10) || 0;
    const totModulos = parseInt(cols[9], 10) || 0;
    const conclusaoStr = cols[10]?.trim() || '';
    let rawStatus = cols[11]?.trim() as DemandStatus;
    const rawTipo = cols[12]?.trim() as DemandType;

    // Standardize status
    let status: DemandStatus = rawStatus || 'Sem Status';
    if (!status || status === 'Sem Status') {
      if (conclusaoStr) status = 'Concluída Geral';
      else status = 'Em Andamento';
    }

    const startDate = parseDate(prevInicioStr);
    const endDate = parseDate(prevFimStr);
    const completionDate = parseDate(conclusaoStr);

    // Calculate days open
    let daysOpen = 0;
    if (startDate) {
      const calcEnd = completionDate || REFERENCE_DATE;
      daysOpen = Math.max(0, calculateDaysBetween(startDate, calcEnd));
    }

    // Overdue days
    let daysLate = 0;
    if (endDate && !completionDate && status === 'Em Andamento') {
      const diff = calculateDaysBetween(endDate, REFERENCE_DATE);
      if (diff > 0) daysLate = diff;
    }

    // Determine current stage & bottlenecks
    let currentStage: ProcessStage = 'kickoff';
    const bottlenecks: string[] = [];
    let progressPercent = 10;

    if (status === 'Concluída Geral') {
      currentStage = 'concluido';
      progressPercent = 100;
    } else if (status === 'Concluída (CS Finalizar TEP)') {
      currentStage = 'tep_cs';
      progressPercent = 90;
      bottlenecks.push('Aguardando emissão e assinatura do TEP / Validação pelo CS');
    } else if (status === 'Cancelada' || status === 'Pausada') {
      currentStage = 'pausado_cancelado';
      progressPercent = status === 'Cancelada' ? 0 : 40;
    } else {
      // In progress
      if (!implantador || implantador === '') {
        currentStage = 'kickoff';
        progressPercent = 15;
        bottlenecks.push('Sem implantador alocado na fila');
      } else if (totModulos >= 4 && hrsNeg < totModulos * 2.5) {
        currentStage = 'parametrizacao';
        progressPercent = 35;
        bottlenecks.push(`Gargalo de Escopo: ${totModulos} módulos com apenas ${hrsNeg}h contratadas`);
      } else if (pessoasTreinar >= 3) {
        currentStage = 'treinamento';
        progressPercent = 55;
        bottlenecks.push(`Treinamento Complexo: ${pessoasTreinar} pessoas para capacitar`);
      } else if (daysLate > 0) {
        currentStage = 'homologacao';
        progressPercent = 75;
        bottlenecks.push(`Atraso na Homologação: Venceu há ${daysLate} dias`);
      } else {
        currentStage = 'treinamento';
        progressPercent = 50;
      }
    }

    // Check lack of weekly evolutions
    // If it's ongoing, how long since expected progress/evolution
    let daysSinceLastEvolution = 0;
    let weeklyEvolutionState: 'critico' | 'alerta' | 'em_dia' | 'concluido' | 'inativo' = 'em_dia';

    if (status === 'Em Andamento') {
      // If no implantador is assigned and it was opened weeks ago, stagnation is extreme
      if (!implantador) {
        daysSinceLastEvolution = startDate ? calculateDaysBetween(startDate, REFERENCE_DATE) : 21;
      } else if (daysLate > 30) {
        daysSinceLastEvolution = Math.min(daysLate, 45);
      } else if (daysLate > 0) {
        daysSinceLastEvolution = daysLate + 7;
      } else if (startDate) {
        const openedDays = calculateDaysBetween(startDate, REFERENCE_DATE);
        daysSinceLastEvolution = Math.min(openedDays, 14);
      } else {
        daysSinceLastEvolution = 10;
      }

      if (daysSinceLastEvolution > 14) {
        weeklyEvolutionState = 'critico';
        bottlenecks.push(`Estagnado: Sem evolução semanal há mais de ${daysSinceLastEvolution} dias`);
      } else if (daysSinceLastEvolution >= 7) {
        weeklyEvolutionState = 'alerta';
        bottlenecks.push(`Atenção: Sem evolução semanal há ${daysSinceLastEvolution} dias`);
      } else {
        weeklyEvolutionState = 'em_dia';
      }
    } else if (status === 'Concluída Geral') {
      weeklyEvolutionState = 'concluido';
    } else {
      weeklyEvolutionState = 'inativo';
    }

    demands.push({
      seq,
      prevInicio: prevInicioStr,
      prevFim: prevFimStr,
      implantador: implantador || 'Não Atribuído',
      clienteId,
      razaoSocial,
      comercial,
      hrsNeg,
      pessoasTreinar,
      totModulos,
      conclusao: conclusaoStr,
      status,
      tipo: rawTipo || 'Outros',
      startDate,
      endDate,
      completionDate,
      daysOpen,
      daysLate,
      daysSinceLastEvolution,
      weeklyEvolutionState,
      currentStage,
      progressPercent,
      bottlenecks,
      checkIns: [
        {
          date: '28/09/2026',
          stage: currentStage,
          progressPercent,
          note: bottlenecks.length > 0 ? bottlenecks.join('; ') : 'Acompanhamento de rotina',
          blocker: bottlenecks[0]
        }
      ]
    });
  }

  return demands;
}

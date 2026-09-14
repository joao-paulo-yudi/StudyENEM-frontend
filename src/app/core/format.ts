import { areaShort } from './areas.config';

/** Tempo de referência por questão no cronômetro (igual ao backend): 3 minutos. */
export const SECONDS_PER_QUESTION = 180;

export function formatNumber(value: number, digits = 0): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** 45s · 2min 10s · 38min · 1h 05min */
export function formatDuration(totalSeconds: number | null | undefined): string {
  if (totalSeconds == null) return '–';
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}min`;
  if (m > 0) return m < 10 && sec > 0 ? `${m}min ${sec}s` : `${m}min`;
  return `${sec}s`;
}

/** 07:05 · 1:02:09 */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatDate(iso: string, style: 'short' | 'long' = 'short'): string {
  return new Date(iso).toLocaleDateString('pt-BR', style === 'short'
    ? { day: '2-digit', month: 'short', year: '2-digit' }
    : { day: '2-digit', month: 'long', year: 'numeric' });
}

export function attemptLabel(a: { mode: string; areaCode: string | null; topic: string | null; total?: number }): string {
  if (a.topic) return `Treino · ${a.topic}`;
  if (a.mode === 'foco') return `Foco · ${areaShort(a.areaCode)}`;
  return a.total === 180 ? 'Prova completa' : 'Simulado Geral';
}

/** Verde ≥ 60%, âmbar ≥ 40%, vermelho abaixo. */
export function scoreColor(percentage: number): string {
  return percentage >= 60 ? '#059669' : percentage >= 40 ? '#B8841C' : '#C73A1E';
}

import { ChartData, ChartOptions } from 'chart.js';
import { AreaPerformanceDto, AttemptSummaryDto } from './api.service';
import { AREA_LIST, getAreaByName } from './areas.config';

const ORANGE = '#F26B3A';
const NAVY = '#0F1B3D';
const GRID = '#F0F2F7';
const MUTED = '#7B8597';

function fmtShort(s: string): string {
  return new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
function fmtLong(s: string): string {
  return new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}
function areaShort(name?: string | null): string {
  return name ? (getAreaByName(name)?.short ?? name) : 'Geral';
}

/** Tooltip base com a identidade visual do app. */
const tooltipStyle = {
  backgroundColor: NAVY,
  titleColor: '#fff',
  bodyColor: '#E5E7EB',
  padding: 12,
  cornerRadius: 8,
  displayColors: false,
} as const;

/**
 * Gráfico de linha (área) da evolução do aproveitamento ao longo dos simulados.
 * `attempts` deve vir em ordem cronológica (do mais antigo ao mais recente).
 */
export function buildEvolutionChart(attempts: AttemptSummaryDto[]): {
  data: ChartData<'line'>;
  options: ChartOptions<'line'>;
} {
  const data: ChartData<'line'> = {
    labels: attempts.map(a => fmtShort(a.date)),
    datasets: [{
      label: 'Aproveitamento',
      data: attempts.map(a => Math.round(a.score)),
      borderColor: ORANGE,
      backgroundColor: 'rgba(242,107,58,0.12)',
      fill: true,
      tension: 0.35,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: '#fff',
      pointBorderColor: ORANGE,
      pointBorderWidth: 2,
    }],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipStyle,
        callbacks: {
          title: (items) => fmtLong(attempts[items[0].dataIndex].date),
          label: (item) => {
            const a = attempts[item.dataIndex];
            const modo = a.mode === 'foco' ? `Foco · ${areaShort(a.area)}` : 'Geral';
            return [`Aproveitamento: ${Math.round(a.score)}%`, `${a.correct}/${a.total} acertos · ${modo}`];
          },
        },
      },
    },
    scales: {
      y: {
        min: 0, max: 100,
        ticks: { stepSize: 25, color: MUTED, font: { size: 11 }, callback: (v) => `${v}%` },
        grid: { color: GRID },
        border: { display: false },
      },
      x: {
        ticks: { color: MUTED, font: { size: 11 } },
        grid: { display: false },
        border: { display: false },
      },
    },
  };

  return { data, options };
}

/** Gráfico radar do aproveitamento por área do conhecimento. */
export function buildAreaRadarChart(byArea: AreaPerformanceDto[]): {
  data: ChartData<'radar'>;
  options: ChartOptions<'radar'>;
} {
  const perArea = AREA_LIST.map(cfg => {
    const found = byArea.find(b => getAreaByName(b.area)?.id === cfg.id);
    return { short: cfg.short, pct: found ? Math.round(found.percentage) : 0 };
  });

  const data: ChartData<'radar'> = {
    labels: perArea.map(a => a.short),
    datasets: [{
      label: 'Aproveitamento',
      data: perArea.map(a => a.pct),
      borderColor: ORANGE,
      backgroundColor: 'rgba(242,107,58,0.15)',
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: '#fff',
      pointBorderColor: ORANGE,
      pointBorderWidth: 2,
    }],
  };

  const options: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipStyle,
        callbacks: { label: (item) => `${item.label}: ${item.formattedValue}%` },
      },
    },
    scales: {
      r: {
        min: 0, max: 100,
        ticks: { stepSize: 25, color: MUTED, font: { size: 9 }, backdropColor: 'transparent', showLabelBackdrop: false },
        grid: { color: GRID },
        angleLines: { color: '#E5E7EB' },
        pointLabels: { color: MUTED, font: { size: 11 } },
      },
    },
  };

  return { data, options };
}

import { ChartData, ChartOptions } from 'chart.js';
import { AreaPerformanceDto, AttemptSummaryDto } from './api.service';
import { AREA_LIST } from './areas.config';
import { attemptLabel } from './format';

const ORANGE = '#F26B3A';
const NAVY = '#0F1B3D';
const GRID = '#F0F2F7';
const MUTED = '#7B8597';

export type EvolutionMetric = 'percentage' | 'tri';

function fmtShort(s: string): string {
  return new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
function fmtLong(s: string): string {
  return new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

/** Tooltip base com a identidade visual do app. */
const tooltipStyle = {
  backgroundColor: NAVY,
  titleColor: '#fff',
  bodyColor: '#E5E7EB',
  padding: 12,
  cornerRadius: 8,
} as const;

/**
 * Aproveitamento geral ao longo dos simulados.
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
      data: attempts.map(a => Math.round(a.percentage)),
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
        displayColors: false,
        callbacks: {
          title: (items) => fmtLong(attempts[items[0].dataIndex].date),
          label: (item) => {
            const a = attempts[item.dataIndex];
            const lines = [`Aproveitamento: ${Math.round(a.percentage)}%`, `${a.correct}/${a.total} acertos · ${attemptLabel(a)}`];
            if (a.triAverage != null) lines.push(`Nota TRI média: ${Math.round(a.triAverage)}`);
            return lines;
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

/**
 * Evolução temporal por área do conhecimento (métrica iii): aproveitamento (%) ou nota TRI,
 * um traço por área. Simulados que não incluem a área ficam como lacuna na linha.
 */
export function buildAreaEvolutionChart(attempts: AttemptSummaryDto[], metric: EvolutionMetric): {
  data: ChartData<'line'>;
  options: ChartOptions<'line'>;
} {
  const data: ChartData<'line'> = {
    labels: attempts.map(a => fmtShort(a.date)),
    datasets: AREA_LIST.map(cfg => ({
      label: cfg.short,
      data: attempts.map(a => {
        const r = a.byArea.find(x => x.areaCode === cfg.code);
        if (!r) return null;
        return metric === 'tri' ? (r.tri ? Math.round(r.tri.score) : null) : Math.round(r.percentage);
      }),
      borderColor: cfg.color,
      backgroundColor: cfg.color,
      spanGaps: true,
      tension: 0.3,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
    })),
  };

  const unit = metric === 'tri' ? '' : '%';
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, color: MUTED, font: { size: 11 } } },
      tooltip: {
        ...tooltipStyle,
        callbacks: {
          title: (items) => fmtLong(attempts[items[0].dataIndex].date),
          label: (item) => `${item.dataset.label}: ${item.formattedValue}${unit}`,
        },
      },
    },
    scales: {
      y: metric === 'tri'
        ? { suggestedMin: 350, suggestedMax: 800, ticks: { color: MUTED, font: { size: 11 } }, grid: { color: GRID }, border: { display: false } }
        : { min: 0, max: 100, ticks: { stepSize: 25, color: MUTED, font: { size: 11 }, callback: (v) => `${v}%` }, grid: { color: GRID }, border: { display: false } },
      x: { ticks: { color: MUTED, font: { size: 11 } }, grid: { display: false }, border: { display: false } },
    },
  };

  return { data, options };
}

/** Radar do aproveitamento por área do conhecimento. */
export function buildAreaRadarChart(byArea: AreaPerformanceDto[]): {
  data: ChartData<'radar'>;
  options: ChartOptions<'radar'>;
} {
  const perArea = AREA_LIST.map(cfg => {
    const found = byArea.find(b => b.areaCode === cfg.code);
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
        displayColors: false,
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

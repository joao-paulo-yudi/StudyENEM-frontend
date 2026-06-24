import {
  Component, ElementRef, Input, AfterViewInit, OnChanges, OnDestroy,
  SimpleChanges, ViewChild,
} from '@angular/core';
import { Chart, ChartConfiguration, ChartData, ChartOptions, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

/**
 * Wrapper standalone reutilizável sobre Chart.js.
 * Recebe tipo, dados e opções; cria, atualiza e destrói a instância do gráfico
 * conforme o ciclo de vida do componente. Os gráficos são interativos por padrão
 * (tooltips/hover do próprio Chart.js).
 */
@Component({
  selector: 'app-chart',
  standalone: true,
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() type: ChartType = 'line';
  @Input({ required: true }) data!: ChartData;
  @Input() options: ChartOptions = {};

  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private viewReady = false;

  ngAfterViewInit() {
    this.viewReady = true;
    this.render();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.viewReady) return;
    // Atualiza os dados in-place quando apenas eles mudam (mantém animação);
    // recria a instância quando o tipo do gráfico muda.
    if (this.chart && changes['data'] && !changes['type']) {
      this.chart.data = this.data;
      if (changes['options']) this.chart.options = this.options;
      this.chart.update();
    } else {
      this.render();
    }
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  private render() {
    if (!this.data) return;
    this.chart?.destroy();
    const config: ChartConfiguration = {
      type: this.type,
      data: this.data,
      options: this.options,
    };
    this.chart = new Chart(this.canvasRef.nativeElement, config);
  }
}

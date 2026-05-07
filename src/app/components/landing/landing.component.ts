import {
  Component, OnInit, AfterViewInit, OnDestroy,
  ElementRef, ViewChild, ChangeDetectorRef
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { environment } from '../../environments/environment';

// Register only what we need (smaller bundle)
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const apiUrl = environment.apiUrl;

interface DashboardItem {
  activity: string;
  achievement: number;
  target: number;
}

@Component({
  selector: 'landing',
  templateUrl: './landing.component.html'
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('trainingChart') canvasRef!: ElementRef<HTMLCanvasElement>;

  dashboardData: DashboardItem[] = [];
  isLoading = true;
  error: string | null = null;

  private chart: Chart | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  ngAfterViewInit(): void {
    // View is ready — if data already loaded, draw now
    if (!this.isLoading && this.dashboardData.length > 0) {
      this.drawChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  fetchDashboardData(): void {
    this.isLoading = true;
    this.error = null;

    this.http.get<DashboardItem[]>(`${apiUrl}/api/beneficiary/dashboard`).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
        this.cdr.detectChanges();   // flush DOM so *ngIf reveals the canvas
        this.drawChart();
      },
      error: (err) => {
        this.error = 'Failed to load dashboard data. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  private drawChart(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) { return; }

    // Destroy previous instance before re-drawing (e.g. on Refresh)
    this.chart?.destroy();
    this.chart = null;

    const labels   = this.dashboardData.map(d => this.shortenLabel(d.activity));
    const achieved = this.dashboardData.map(d => d.achievement);
    const targets  = this.dashboardData.map(d => d.target);

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Achievement',
            data: achieved,
            backgroundColor: 'rgba(251, 140, 0, 0.85)',
            borderColor:     'rgba(251, 140, 0, 1)',
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false
          },
          {
            label: 'Target',
            data: targets,
            backgroundColor: 'rgba(66, 165, 245, 0.55)',
            borderColor:     'rgba(66, 165, 245, 1)',
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { font: { size: 13 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            ticks: { maxRotation: 35, minRotation: 20, font: { size: 11 } },
            grid:  { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { callback: (v) => Number(v).toLocaleString() }
          }
        }
      }
    });
  }

  min100(value: number): number {
    return Math.min(value, 100);
  }

  private shortenLabel(label: string): string {
    const map: Record<string, string> = {
      'Financial Literacy Training': 'Fin. Literacy',
      'BDS Training': 'BDS',
      'GALS': 'GALS',
      'Nutrition & SBCC': 'Nutrition',
      'SHEP Training': 'SHEP',
      'NRM & ESS training': 'NRM & ESS',
      'CSA Training-Crop Production': 'CSA Crop',
      'CSA Training-Livestock Production': 'CSA Livestock',
      'Training on income-generating activities or business Management (BDS, FL)': 'IGA/BDS/FL'
    };
    return map[label] ?? label;
  }
}
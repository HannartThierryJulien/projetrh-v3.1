import {Component, ElementRef, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Subject, takeUntil} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {CandidateTest} from "../../../models/candidate-test.model";
import {Chart, registerables} from "chart.js";

@Component({
  selector: 'app-chart-tests-status',
  templateUrl: './chart-tests-status.component.html',
  styleUrl: './chart-tests-status.component.scss'
})
export class ChartTestsStatusComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  private elementRef = inject(ElementRef);
  private translateService = inject(TranslateService);

  @Input() candidateTestsSubject!: BehaviorSubject<CandidateTest[]>;
  private candidateTests: CandidateTest[] = [];
  nbrTestsFraudSuspicion: number = 0;
  nbrTestsStarted: number = 0;
  nbrTestsEnded: number = 0;
  nbrTestsAssigned: number = 0;
  chart: any;

  constructor() {
  }

  ngOnInit() {
    this.createChart().then(() => {
      this.loadChartData();
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private async createChart() {
    return new Promise<void>((resolve, reject) => {
      Chart.register(...registerables);

      const canvas = this.elementRef.nativeElement.querySelector('#chartTestsStatus');
      if (canvas) {
        this.chart = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: [this.translateService.instant('assigned'), this.translateService.instant('started'), this.translateService.instant('ended'), this.translateService.instant('fraudSuspicion')],
            datasets: [{
              // label: '# of tests',
              data: [this.nbrTestsAssigned, this.nbrTestsStarted, this.nbrTestsEnded, this.nbrTestsFraudSuspicion],
              backgroundColor: [
                '#70A1D7',
                '#FFC55A',
                '#A1DE93',
                '#F47C7C'
              ],
              borderWidth: 1,
              barThickness: 20, // Fixed thickness for each bar
              categoryPercentage: 0.05, // Reduces space between categories
              barPercentage: 0.08
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
              x: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                },
              }
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    return ' ' + context.raw + ' ' + this.translateService.instant('tests');
                  }
                }
              }
            }
          }
        });
        resolve();
      } else {
        console.error('Canvas element with ID "chartTestsStatus" not found.');
        reject();
      }
    });
  }

  private loadChartData() {
    this.candidateTestsSubject
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(candidateTests => {
        this.candidateTests = candidateTests;
        this.sortData(this.candidateTests);
        this.updateChart();
      });
  }

  private sortData(candidateTests: CandidateTest[]) {
    this.nbrTestsEnded = 0;
    this.nbrTestsStarted = 0;
    this.nbrTestsAssigned = 0;
    this.nbrTestsFraudSuspicion = 0;

    candidateTests.forEach(ct => {
      switch (ct.status) {
        case "started": {
          this.nbrTestsStarted++;
          break;
        }
        case "ended": {
          this.nbrTestsEnded++;
          break;
        }
        case "fraudSuspicion": {
          this.nbrTestsFraudSuspicion++;
          break;
        }
        default: {
          this.nbrTestsAssigned++;
          break;
        }
      }
    });
  }

  private updateChart() {
    if (this.chart && this.chart.data && this.chart.data.datasets) {
      this.chart.data.datasets[0].data = [this.nbrTestsAssigned, this.nbrTestsStarted, this.nbrTestsEnded, this.nbrTestsFraudSuspicion];
      this.chart.update();
    } else {
      console.error("Chart not initialized.");
    }
  }
}





import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { APISchedulesResponse } from '../models/api-schedules-response';
import { CommonModule } from '@angular/common';
import { delayWhen, repeat, interval, tap } from 'rxjs';
import { APIScreensResponse } from '../models/api-screens-response';
import { environment } from '../environments/environment';
import { MatTableModule } from '@angular/material/table';
import { ContentObserver } from '@angular/cdk/observers';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HttpClientModule,
    CommonModule,
    MatTableModule,
    MatCardModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  protected readonly API_Path = environment.apiUrl;
  private readonly httpClient = inject(HttpClient);
  private readonly contentObserver = inject(ContentObserver);
  private firstScreensRes = true;
  private nextSchedulesInterval = 0;
  private lastItemWasImage = false;
  public displayedColumns = ['hours', 'name', 'teacher', 'room', 'group'];
  private interval: any;

  protected schedulesData$ = this.httpClient
    .get<APISchedulesResponse>(`${this.API_Path}/schedules`)
    .pipe(
      delayWhen((x) => {
        const currentInterval = this.nextSchedulesInterval;
        this.nextSchedulesInterval = Math.max(x.items.length * 1250, 10000);
        return interval(currentInterval);
      }),
      repeat()
    );

  protected screensData$ = this.httpClient
    .get<APIScreensResponse>(`${this.API_Path}/screens`)
    .pipe(
      delayWhen((x) => {
        if (this.firstScreensRes) {
          this.firstScreensRes = false;
          this.lastItemWasImage = x.isImage;
          return interval(0);
        }

        const res = this.lastItemWasImage ? interval(10000) : interval(120000);
        this.lastItemWasImage = x.isImage;
        return res;
      }),
      repeat()
    );

  ngAfterViewInit(): void {
    const contentWrapper = document.querySelector('.schedule-container');
    if (contentWrapper) {
      this.contentObserver
        .observe(contentWrapper)
        .subscribe(this.tableContentChanged);
    }
  }

  tableContentChanged() {
    const table = document.querySelector('#schedule-table');
    clearInterval(this.interval);
    if (table) {
      setTimeout(() => {
        let scrollTo = 0;

        this.interval = setInterval(() => {
          table.scrollTo(scrollTo, scrollTo);
          scrollTo += 5;
        }, 100);
      }, 200);
    }
  }
}

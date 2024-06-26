import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  inject,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { APISchedulesResponse } from '../models/api-schedules-response';
import { CommonModule } from '@angular/common';
import { delayWhen, repeat, interval, map, BehaviorSubject } from 'rxjs';
import { APIScreensResponse } from '../models/api-screens-response';
import { environment } from '../environments/environment';
import { ContentObserver } from '@angular/cdk/observers';
import { LessonClass } from './models/lesson.class';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements AfterViewChecked, AfterViewInit {
  protected readonly API_Path = environment.apiUrl;
  private readonly httpClient = inject(HttpClient);
  private readonly contentObserver = inject(ContentObserver);
  private firstScreensRes = true;
  private nextSchedulesInterval = 0;
  private lastItemWasImage = false;
  public displayedColumns = ['hours', 'name', 'teacher', 'room', 'group'];
  private interval: any;

  private title = new BehaviorSubject<string>('Wczytywanie...');

  public title$ = this.title.asObservable();
  private newData = false;

  protected schedulesData$ = this.httpClient
    .get<APISchedulesResponse>(`${this.API_Path}/schedules`)
    .pipe(
      delayWhen((x) => {
        const currentInterval = this.nextSchedulesInterval;
        this.nextSchedulesInterval = Math.max(x.items.length * 3000, 20000);
        return interval(currentInterval);
      }),
      map((x) => {
        this.newData = true;
        this.title.next(x.name);
        return x.items.map((i) => new LessonClass(i));
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

        const res = this.lastItemWasImage ? interval(20000) : interval(120000);
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

  ngAfterViewChecked(): void {
    if (this.newData) {
      this.newData = false;
      const scheduleContainer = document.getElementById(
        'schedule-container'
      ) as HTMLDivElement;
      const lessons = scheduleContainer.getElementsByClassName('lesson');
      let divide = 0;
      let duration = 0;
      if (lessons.length > 0) {
        let lessonsHeight = lessons.length * 10;
        for (let i = 0; i < lessons.length; i++) {
          lessonsHeight += (lessons[i] as HTMLDivElement).offsetHeight;
        }

        divide = lessonsHeight - scheduleContainer.offsetHeight;
        divide = divide > 0 ? divide : 0;
        duration = Math.ceil(divide / 30);
      }

      document.body.style.setProperty(`--scroll-limit`, `${divide * -1}px`);
      document.body.style.setProperty(`--animation-duration`, `${duration}s`);
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

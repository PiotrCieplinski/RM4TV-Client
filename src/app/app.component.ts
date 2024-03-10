import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { APISchedulesResponse } from '../models/api-schedules-response';
import { CommonModule } from '@angular/common';
import { delayWhen, repeat, interval } from 'rxjs';
import { APIScreensResponse } from '../models/api-screens-response';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  protected readonly API_Path = 'https://metet.polsl.pl/api';
  private readonly httpClient = inject(HttpClient);
  private first = true;
  private lastItemWasImage = false;

  protected schedulesData$ = this.httpClient.get<APISchedulesResponse>(`${this.API_Path}/schedules`).pipe(repeat({delay: 10000}));

  protected screensData$ = this.httpClient.get<APIScreensResponse>(`${this.API_Path}/screens`).pipe(delayWhen(x => {
    if(this.first){
      this.first = false;
      this.lastItemWasImage = x.isImage;
      return interval(0);
    }  
    
    const res = this.lastItemWasImage ? interval(10000) : interval(120000);
    this.lastItemWasImage = x.isImage;
    return res;
  }), repeat());
}

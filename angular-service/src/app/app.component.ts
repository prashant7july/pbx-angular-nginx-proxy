import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Spinkit } from 'ng-http-loader';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public spinkit = Spinkit;
  constructor(private router: Router, private http: HttpClient,) { }

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }
}

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAdminSmsReportComponent } from './view-admin-sms-report.component';

describe('ViewAdminSmsReportComponent', () => {
  let component: ViewAdminSmsReportComponent;
  let fixture: ComponentFixture<ViewAdminSmsReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAdminSmsReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAdminSmsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCustomerSmsReportComponent } from './view-customer-sms-report.component';

describe('ViewCustomerSmsReportComponent', () => {
  let component: ViewCustomerSmsReportComponent;
  let fixture: ComponentFixture<ViewCustomerSmsReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCustomerSmsReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCustomerSmsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

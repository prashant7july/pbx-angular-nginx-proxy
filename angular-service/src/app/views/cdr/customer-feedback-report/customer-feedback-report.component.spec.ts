import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerFeedbackReportComponent } from './customer-feedback-report.component';

describe('CustomerFeedbackReportComponent', () => {
  let component: CustomerFeedbackReportComponent;
  let fixture: ComponentFixture<CustomerFeedbackReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerFeedbackReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerFeedbackReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

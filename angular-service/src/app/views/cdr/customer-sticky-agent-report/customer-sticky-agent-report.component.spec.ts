import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerStickyAgentReportComponent } from './customer-sticky-agent-report.component';

describe('CustomerStickyAgentReportComponent', () => {
  let component: CustomerStickyAgentReportComponent;
  let fixture: ComponentFixture<CustomerStickyAgentReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerStickyAgentReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerStickyAgentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

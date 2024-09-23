import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerLiveCallDashboardComponent } from './customer-live-call-dashboard.component';

describe('CustomerLiveCallDashboardComponent', () => {
  let component: CustomerLiveCallDashboardComponent;
  let fixture: ComponentFixture<CustomerLiveCallDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerLiveCallDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerLiveCallDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

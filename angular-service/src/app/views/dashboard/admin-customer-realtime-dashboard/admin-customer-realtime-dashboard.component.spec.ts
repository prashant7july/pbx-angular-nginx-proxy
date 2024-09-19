import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCustomerRealtimeDashboardComponent } from './admin-customer-realtime-dashboard.component';

describe('AdminCustomerRealtimeDashboardComponent', () => {
  let component: AdminCustomerRealtimeDashboardComponent;
  let fixture: ComponentFixture<AdminCustomerRealtimeDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminCustomerRealtimeDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCustomerRealtimeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

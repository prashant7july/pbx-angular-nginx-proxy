import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerRealtimeDashboardComponent } from './customer-realtime-dashboard.component';

describe('CustomerRealtimeDashboardComponent', () => {
  let component: CustomerRealtimeDashboardComponent;
  let fixture: ComponentFixture<CustomerRealtimeDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerRealtimeDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerRealtimeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

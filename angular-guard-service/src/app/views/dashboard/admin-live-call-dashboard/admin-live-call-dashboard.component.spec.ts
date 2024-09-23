import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLiveCallDashboardComponent } from './admin-live-call-dashboard.component';

describe('AdminLiveCallDashboardComponent', () => {
  let component: AdminLiveCallDashboardComponent;
  let fixture: ComponentFixture<AdminLiveCallDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminLiveCallDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminLiveCallDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

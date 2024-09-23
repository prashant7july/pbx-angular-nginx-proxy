import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAppointmentCdrComponent } from './view-appointment-cdr.component';

describe('ViewAppointmentCdrComponent', () => {
  let component: ViewAppointmentCdrComponent;
  let fixture: ComponentFixture<ViewAppointmentCdrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAppointmentCdrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAppointmentCdrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

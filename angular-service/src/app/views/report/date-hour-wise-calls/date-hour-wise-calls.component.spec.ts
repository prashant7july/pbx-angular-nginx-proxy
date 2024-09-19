import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateHourWiseCallsComponent } from './date-hour-wise-calls.component';

describe('DateHourWiseCallsComponent', () => {
  let component: DateHourWiseCallsComponent;
  let fixture: ComponentFixture<DateHourWiseCallsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DateHourWiseCallsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateHourWiseCallsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

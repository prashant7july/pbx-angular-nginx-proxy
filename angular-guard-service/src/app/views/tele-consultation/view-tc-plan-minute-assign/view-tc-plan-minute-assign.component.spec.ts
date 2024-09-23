import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTcPlanMinuteAssignComponent } from './view-tc-plan-minute-assign.component';

describe('ViewTcPlanMinuteAssignComponent', () => {
  let component: ViewTcPlanMinuteAssignComponent;
  let fixture: ComponentFixture<ViewTcPlanMinuteAssignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTcPlanMinuteAssignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTcPlanMinuteAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

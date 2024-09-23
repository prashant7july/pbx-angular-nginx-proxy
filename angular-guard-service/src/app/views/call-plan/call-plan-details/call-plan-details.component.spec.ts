import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallPlanDetailsComponent } from './call-plan-details.component';

describe('CallPlanDetailsComponent', () => {
  let component: CallPlanDetailsComponent;
  let fixture: ComponentFixture<CallPlanDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallPlanDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallPlanDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

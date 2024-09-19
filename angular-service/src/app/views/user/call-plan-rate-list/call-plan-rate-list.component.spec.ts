import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallPlanRateListComponent } from './call-plan-rate-list.component';

describe('CallPlanRateListComponent', () => {
  let component: CallPlanRateListComponent;
  let fixture: ComponentFixture<CallPlanRateListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallPlanRateListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallPlanRateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignBoosterPlanComponent } from './assign-booster-plan.component';

describe('AssignBoosterPlanComponent', () => {
  let component: AssignBoosterPlanComponent;
  let fixture: ComponentFixture<AssignBoosterPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignBoosterPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignBoosterPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

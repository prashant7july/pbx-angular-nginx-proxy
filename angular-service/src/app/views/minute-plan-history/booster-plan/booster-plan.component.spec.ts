import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoosterPlanComponent } from './booster-plan.component';

describe('BoosterPlanComponent', () => {
  let component: BoosterPlanComponent;
  let fixture: ComponentFixture<BoosterPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoosterPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoosterPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

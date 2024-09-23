import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureRatePlanComponent } from './feature-rate-plan.component';

describe('FeatureRatePlanComponent', () => {
  let component: FeatureRatePlanComponent;
  let fixture: ComponentFixture<FeatureRatePlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeatureRatePlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureRatePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

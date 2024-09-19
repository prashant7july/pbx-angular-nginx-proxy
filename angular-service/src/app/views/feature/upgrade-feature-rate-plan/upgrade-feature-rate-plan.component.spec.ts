import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpgradeFeatureRatePlanComponent } from './upgrade-feature-rate-plan.component';

describe('UpgradeFeatureRatePlanComponent', () => {
  let component: UpgradeFeatureRatePlanComponent;
  let fixture: ComponentFixture<UpgradeFeatureRatePlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpgradeFeatureRatePlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpgradeFeatureRatePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

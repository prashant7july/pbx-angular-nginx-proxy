import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoamingBundlePlanComponent } from './roaming-bundle-plan.component';

describe('RoamingBundlePlanComponent', () => {
  let component: RoamingBundlePlanComponent;
  let fixture: ComponentFixture<RoamingBundlePlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoamingBundlePlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoamingBundlePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

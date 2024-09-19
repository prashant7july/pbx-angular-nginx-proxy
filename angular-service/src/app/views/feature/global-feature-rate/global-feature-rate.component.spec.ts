import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalFeatureRateComponent } from './global-feature-rate.component';

describe('GlobalFeatureRateComponent', () => {
  let component: GlobalFeatureRateComponent;
  let fixture: ComponentFixture<GlobalFeatureRateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalFeatureRateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalFeatureRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

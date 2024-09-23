import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BundlePlanComponent } from './bundle-plan.component';

describe('BundlePlanComponent', () => {
  let component: BundlePlanComponent;
  let fixture: ComponentFixture<BundlePlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BundlePlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BundlePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

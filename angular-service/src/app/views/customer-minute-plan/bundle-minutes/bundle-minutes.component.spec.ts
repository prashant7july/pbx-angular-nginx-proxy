import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BundleMinutesComponent } from './bundle-minutes.component';

describe('BundleMinutesComponent', () => {
  let component: BundleMinutesComponent;
  let fixture: ComponentFixture<BundleMinutesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BundleMinutesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BundleMinutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

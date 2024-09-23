import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeductExtensionMinuteComponent } from './deduct-extension-minute.component';

describe('DeductExtensionMinuteComponent', () => {
  let component: DeductExtensionMinuteComponent;
  let fixture: ComponentFixture<DeductExtensionMinuteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeductExtensionMinuteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeductExtensionMinuteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

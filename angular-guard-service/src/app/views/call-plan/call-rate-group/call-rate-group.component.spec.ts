import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallRateGroupComponent } from './call-rate-group.component';

describe('CallRateGroupComponent', () => {
  let component: CallRateGroupComponent;
  let fixture: ComponentFixture<CallRateGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallRateGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallRateGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogEPaymentComponent } from './log-e-payment.component';

describe('LogEPaymentComponent', () => {
  let component: LogEPaymentComponent;
  let fixture: ComponentFixture<LogEPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogEPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogEPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

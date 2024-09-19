import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallRatesAssociateGroupComponent } from './call-rates-associate-group.component';

describe('CallRatesAssociateGroupComponent', () => {
  let component: CallRatesAssociateGroupComponent;
  let fixture: ComponentFixture<CallRatesAssociateGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallRatesAssociateGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallRatesAssociateGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDialoutRuleComponent } from './customer-dialout-rule.component';

describe('CustomerDialoutRuleComponent', () => {
  let component: CustomerDialoutRuleComponent;
  let fixture: ComponentFixture<CustomerDialoutRuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerDialoutRuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerDialoutRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

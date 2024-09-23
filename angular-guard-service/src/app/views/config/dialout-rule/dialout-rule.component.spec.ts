import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialoutRuleComponent } from './dialout-rule.component';

describe('DialoutRuleComponent', () => {
  let component: DialoutRuleComponent;
  let fixture: ComponentFixture<DialoutRuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialoutRuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialoutRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

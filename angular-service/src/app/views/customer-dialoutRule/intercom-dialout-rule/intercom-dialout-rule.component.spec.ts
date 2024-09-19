import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntercomDialoutRuleComponent } from './intercom-dialout-rule.component';

describe('IntercomDialoutRuleComponent', () => {
  let component: IntercomDialoutRuleComponent;
  let fixture: ComponentFixture<IntercomDialoutRuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntercomDialoutRuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntercomDialoutRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountManagerAccessRestrictionComponent } from './account-manager-access-restriction.component';

describe('AccountManagerAccessRestrictionComponent', () => {
  let component: AccountManagerAccessRestrictionComponent;
  let fixture: ComponentFixture<AccountManagerAccessRestrictionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountManagerAccessRestrictionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountManagerAccessRestrictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

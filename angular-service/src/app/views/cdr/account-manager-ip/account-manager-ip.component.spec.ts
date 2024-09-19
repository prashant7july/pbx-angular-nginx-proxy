import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountManagerIpComponent } from './account-manager-ip.component';

describe('AccountManagerIpComponent', () => {
  let component: AccountManagerIpComponent;
  let fixture: ComponentFixture<AccountManagerIpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountManagerIpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountManagerIpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

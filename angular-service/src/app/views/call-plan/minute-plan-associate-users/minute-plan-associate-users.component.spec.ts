import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MinutePlanAssociateUsersComponent } from './minute-plan-associate-users.component';

describe('MinutePlanAssociateUsersComponent', () => {
  let component: MinutePlanAssociateUsersComponent;
  let fixture: ComponentFixture<MinutePlanAssociateUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MinutePlanAssociateUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MinutePlanAssociateUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

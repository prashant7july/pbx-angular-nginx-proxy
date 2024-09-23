import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAssociateUserComponent } from './group-associate-user.component';

describe('GroupAssociateUserComponent', () => {
  let component: GroupAssociateUserComponent;
  let fixture: ComponentFixture<GroupAssociateUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupAssociateUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAssociateUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

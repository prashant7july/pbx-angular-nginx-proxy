import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAssociateContactsComponent } from './group-associate-contacts.component';

describe('GroupAssociateContactsComponent', () => {
  let component: GroupAssociateContactsComponent;
  let fixture: ComponentFixture<GroupAssociateContactsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupAssociateContactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAssociateContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

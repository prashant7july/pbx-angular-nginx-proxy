import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAssociateCustomerComponent } from './group-associate-customer.component';

describe('GroupAssociateCustomerComponent', () => {
  let component: GroupAssociateCustomerComponent;
  let fixture: ComponentFixture<GroupAssociateCustomerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupAssociateCustomerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAssociateCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

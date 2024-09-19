import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAssociateRateComponent } from './group-associate-rate.component';

describe('GroupAssociateRateComponent', () => {
  let component: GroupAssociateRateComponent;
  let fixture: ComponentFixture<GroupAssociateRateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupAssociateRateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAssociateRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

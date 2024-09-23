import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerMappedMinutePlanComponent } from './customer-mapped-minute-plan.component';

describe('CustomerMappedMinutePlanComponent', () => {
  let component: CustomerMappedMinutePlanComponent;
  let fixture: ComponentFixture<CustomerMappedMinutePlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerMappedMinutePlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerMappedMinutePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

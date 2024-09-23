import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCustomerSmsPlanComponent } from './view-customer-sms-plan.component';

describe('ViewCustomerSmsPlanComponent', () => {
  let component: ViewCustomerSmsPlanComponent;
  let fixture: ComponentFixture<ViewCustomerSmsPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCustomerSmsPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCustomerSmsPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

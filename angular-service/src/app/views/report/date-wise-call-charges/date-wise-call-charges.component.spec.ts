import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateWiseCallChargesComponent } from './date-wise-call-charges.component';

describe('DateWiseCallChargesComponent', () => {
  let component: DateWiseCallChargesComponent;
  let fixture: ComponentFixture<DateWiseCallChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DateWiseCallChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateWiseCallChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

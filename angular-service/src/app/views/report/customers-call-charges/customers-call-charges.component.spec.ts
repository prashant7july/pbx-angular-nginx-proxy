import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersCallChargesComponent } from './customers-call-charges.component';

describe('CustomersCallChargesComponent', () => {
  let component: CustomersCallChargesComponent;
  let fixture: ComponentFixture<CustomersCallChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomersCallChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomersCallChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

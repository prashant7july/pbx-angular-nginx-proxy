import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCustomerTemplateComponent } from './view-customer-template.component';

describe('ViewCustomerTemplateComponent', () => {
  let component: ViewCustomerTemplateComponent;
  let fixture: ComponentFixture<ViewCustomerTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCustomerTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCustomerTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersCallDetailComponent } from './customers-call-detail.component';

describe('CustomersCallDetailComponent', () => {
  let component: CustomersCallDetailComponent;
  let fixture: ComponentFixture<CustomersCallDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomersCallDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomersCallDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

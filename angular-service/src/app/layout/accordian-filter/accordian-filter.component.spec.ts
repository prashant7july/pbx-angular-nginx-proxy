import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordianFilterComponent } from './accordian-filter.component';

describe('AccordianFilterComponent', () => {
  let component: AccordianFilterComponent;
  let fixture: ComponentFixture<AccordianFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccordianFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccordianFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

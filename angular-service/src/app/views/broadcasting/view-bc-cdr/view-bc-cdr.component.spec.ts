import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBcCdrComponent } from './view-bc-cdr.component';

describe('ViewBcCdrComponent', () => {
  let component: ViewBcCdrComponent;
  let fixture: ComponentFixture<ViewBcCdrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewBcCdrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewBcCdrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

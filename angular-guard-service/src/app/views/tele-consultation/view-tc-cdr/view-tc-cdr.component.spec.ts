import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTcCdrComponent } from './view-tc-cdr.component';

describe('ViewTcCdrComponent', () => {
  let component: ViewTcCdrComponent;
  let fixture: ComponentFixture<ViewTcCdrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTcCdrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTcCdrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

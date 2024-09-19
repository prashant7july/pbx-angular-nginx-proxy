import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBcListComponent } from './view-bc-list.component';

describe('ViewBcListComponent', () => {
  let component: ViewBcListComponent;
  let fixture: ComponentFixture<ViewBcListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewBcListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewBcListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

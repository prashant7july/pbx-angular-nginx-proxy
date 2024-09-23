import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTcListComponent } from './view-tc-list.component';

describe('ViewTcListComponent', () => {
  let component: ViewTcListComponent;
  let fixture: ComponentFixture<ViewTcListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTcListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTcListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

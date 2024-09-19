import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTcPlanListComponent } from './view-tc-plan-list.component';

describe('ViewTcPlanListComponent', () => {
  let component: ViewTcPlanListComponent;
  let fixture: ComponentFixture<ViewTcPlanListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTcPlanListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTcPlanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

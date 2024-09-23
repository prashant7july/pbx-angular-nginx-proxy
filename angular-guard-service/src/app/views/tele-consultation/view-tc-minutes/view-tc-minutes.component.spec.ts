import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTcMinutesComponent } from './view-tc-minutes.component';

describe('ViewTcMinutesComponent', () => {
  let component: ViewTcMinutesComponent;
  let fixture: ComponentFixture<ViewTcMinutesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTcMinutesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTcMinutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

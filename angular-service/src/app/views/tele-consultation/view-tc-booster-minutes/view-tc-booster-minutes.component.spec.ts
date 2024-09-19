import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTcBoosterMinutesComponent } from './view-tc-booster-minutes.component';

describe('ViewTcBoosterMinutesComponent', () => {
  let component: ViewTcBoosterMinutesComponent;
  let fixture: ComponentFixture<ViewTcBoosterMinutesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTcBoosterMinutesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTcBoosterMinutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

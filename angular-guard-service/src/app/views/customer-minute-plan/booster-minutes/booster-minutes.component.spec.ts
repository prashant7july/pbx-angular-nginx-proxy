import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoosterMinutesComponent } from './booster-minutes.component';

describe('BoosterMinutesComponent', () => {
  let component: BoosterMinutesComponent;
  let fixture: ComponentFixture<BoosterMinutesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoosterMinutesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoosterMinutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

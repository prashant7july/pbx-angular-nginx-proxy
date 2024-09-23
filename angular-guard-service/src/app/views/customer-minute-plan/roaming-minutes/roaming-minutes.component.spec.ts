import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoamingMinutesComponent } from './roaming-minutes.component';

describe('RoamingMinutesComponent', () => {
  let component: RoamingMinutesComponent;
  let fixture: ComponentFixture<RoamingMinutesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoamingMinutesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoamingMinutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

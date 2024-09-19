import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MinutePlanCallDetailsComponent } from './minute-plan-call-details.component';

describe('MinutePlanCallDetailsComponent', () => {
  let component: MinutePlanCallDetailsComponent;
  let fixture: ComponentFixture<MinutePlanCallDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MinutePlanCallDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MinutePlanCallDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

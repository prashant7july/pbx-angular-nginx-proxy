import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObdCdrComponent } from './obd-cdr.component';

describe('ObdCdrComponent', () => {
  let component: ObdCdrComponent;
  let fixture: ComponentFixture<ObdCdrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObdCdrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObdCdrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

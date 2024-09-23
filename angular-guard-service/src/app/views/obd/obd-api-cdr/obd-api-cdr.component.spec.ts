import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObdApiCdrComponent } from './obd-api-cdr.component';

describe('ObdApiCdrComponent', () => {
  let component: ObdApiCdrComponent;
  let fixture: ComponentFixture<ObdApiCdrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObdApiCdrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObdApiCdrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

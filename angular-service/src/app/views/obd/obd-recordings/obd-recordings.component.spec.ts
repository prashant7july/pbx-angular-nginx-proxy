import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObdRecordingsComponent } from './obd-recordings.component';

describe('ObdRecordingsComponent', () => {
  let component: ObdRecordingsComponent;
  let fixture: ComponentFixture<ObdRecordingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObdRecordingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObdRecordingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

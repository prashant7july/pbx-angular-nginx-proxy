import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OcRecordingComponent } from './oc-recording.component';

describe('OcRecordingComponent', () => {
  let component: OcRecordingComponent;
  let fixture: ComponentFixture<OcRecordingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OcRecordingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OcRecordingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

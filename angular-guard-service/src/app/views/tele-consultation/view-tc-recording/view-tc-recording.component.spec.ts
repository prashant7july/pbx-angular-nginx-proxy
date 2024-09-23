import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTcRecordingComponent } from './view-tc-recording.component';

describe('ViewTcRecordingComponent', () => {
  let component: ViewTcRecordingComponent;
  let fixture: ComponentFixture<ViewTcRecordingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTcRecordingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTcRecordingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoicebotCdrComponent } from './voicebot-cdr.component';

describe('VoicebotCdrComponent', () => {
  let component: VoicebotCdrComponent;
  let fixture: ComponentFixture<VoicebotCdrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoicebotCdrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoicebotCdrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

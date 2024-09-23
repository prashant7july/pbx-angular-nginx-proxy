import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutboundConferenceComponent } from './outbound-conference.component';

describe('OutboundConferenceComponent', () => {
  let component: OutboundConferenceComponent;
  let fixture: ComponentFixture<OutboundConferenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundConferenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundConferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

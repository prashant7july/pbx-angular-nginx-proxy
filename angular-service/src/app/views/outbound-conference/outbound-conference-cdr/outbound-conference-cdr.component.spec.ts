import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutboundConferenceCdrComponent } from './outbound-conference-cdr.component';

describe('OutboundConferenceCdrComponent', () => {
  let component: OutboundConferenceCdrComponent;
  let fixture: ComponentFixture<OutboundConferenceCdrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundConferenceCdrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundConferenceCdrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

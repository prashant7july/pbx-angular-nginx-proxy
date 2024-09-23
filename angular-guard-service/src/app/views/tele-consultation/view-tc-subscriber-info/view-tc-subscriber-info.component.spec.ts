import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTcSubscriberInfoComponent } from './view-tc-subscriber-info.component';

describe('ViewTcSubscriberInfoComponent', () => {
  let component: ViewTcSubscriberInfoComponent;
  let fixture: ComponentFixture<ViewTcSubscriberInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTcSubscriberInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTcSubscriberInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

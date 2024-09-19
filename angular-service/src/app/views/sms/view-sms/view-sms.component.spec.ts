import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSmsComponent } from './view-sms.component';

describe('ViewSmsComponent', () => {
  let component: ViewSmsComponent;
  let fixture: ComponentFixture<ViewSmsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewSmsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

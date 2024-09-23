import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewApiLogsComponent } from './view-api-logs.component';

describe('ViewApiLogsComponent', () => {
  let component: ViewApiLogsComponent;
  let fixture: ComponentFixture<ViewApiLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewApiLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewApiLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

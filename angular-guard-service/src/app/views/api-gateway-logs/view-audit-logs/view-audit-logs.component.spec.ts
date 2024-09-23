import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAuditLogsComponent } from './view-audit-logs.component';

describe('ViewApiLogsComponent', () => {
  let component: ViewAuditLogsComponent;
  let fixture: ComponentFixture<ViewAuditLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAuditLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAuditLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

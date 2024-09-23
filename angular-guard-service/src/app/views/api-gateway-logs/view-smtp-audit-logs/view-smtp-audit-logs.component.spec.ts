import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSmtpAuditLogsComponent } from './view-smtp-audit-logs.component';

describe('ViewSmtpAuditLogsComponent', () => {
  let component: ViewSmtpAuditLogsComponent;
  let fixture: ComponentFixture<ViewSmtpAuditLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewSmtpAuditLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSmtpAuditLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

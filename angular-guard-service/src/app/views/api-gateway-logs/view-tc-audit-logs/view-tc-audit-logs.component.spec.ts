import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTcAuditLogsComponent } from './view-tc-audit-logs.component';

describe('ViewTcAuditLogsComponent', () => {
  let component: ViewTcAuditLogsComponent;
  let fixture: ComponentFixture<ViewTcAuditLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTcAuditLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTcAuditLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

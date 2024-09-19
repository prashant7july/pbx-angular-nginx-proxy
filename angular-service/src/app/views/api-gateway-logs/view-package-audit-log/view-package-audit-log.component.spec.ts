import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPackageAuditLogComponent } from './view-package-audit-log.component';

describe('ViewPackageAuditLogComponent', () => {
  let component: ViewPackageAuditLogComponent;
  let fixture: ComponentFixture<ViewPackageAuditLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewPackageAuditLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPackageAuditLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

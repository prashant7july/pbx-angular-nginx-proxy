import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OcInstanceReportComponent } from './oc-instance-report.component';

describe('OcInstanceReportComponent', () => {
  let component: OcInstanceReportComponent;
  let fixture: ComponentFixture<OcInstanceReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OcInstanceReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OcInstanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

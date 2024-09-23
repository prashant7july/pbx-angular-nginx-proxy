import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObdInstanceReportComponent } from './obd-instance-report.component';

describe('ObdInstanceReportComponent', () => {
  let component: ObdInstanceReportComponent;
  let fixture: ComponentFixture<ObdInstanceReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObdInstanceReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObdInstanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

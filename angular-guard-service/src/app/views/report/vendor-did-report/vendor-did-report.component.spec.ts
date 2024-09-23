import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorDidReportComponent } from './vendor-did-report.component';

describe('VendorDidReportComponent', () => {
  let component: VendorDidReportComponent;
  let fixture: ComponentFixture<VendorDidReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorDidReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorDidReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

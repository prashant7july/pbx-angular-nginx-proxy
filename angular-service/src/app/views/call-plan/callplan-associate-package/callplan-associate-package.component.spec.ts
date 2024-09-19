import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallplanAssociatePackageComponent } from './callplan-associate-package.component';

describe('CallplanAssociatePackageComponent', () => {
  let component: CallplanAssociatePackageComponent;
  let fixture: ComponentFixture<CallplanAssociatePackageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallplanAssociatePackageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallplanAssociatePackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

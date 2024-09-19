import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociatePackageComponent } from './associate-package.component';

describe('AssociatePackageComponent', () => {
  let component: AssociatePackageComponent;
  let fixture: ComponentFixture<AssociatePackageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociatePackageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociatePackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportIpRestrictionComponent } from './support-ip-restriction.component';

describe('SupportIpRestrictionComponent', () => {
  let component: SupportIpRestrictionComponent;
  let fixture: ComponentFixture<SupportIpRestrictionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupportIpRestrictionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportIpRestrictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

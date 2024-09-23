import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAccessRestrictionComponent } from './view-access-restriction.component';

describe('ViewAccessRestrictionComponent', () => {
  let component: ViewAccessRestrictionComponent;
  let fixture: ComponentFixture<ViewAccessRestrictionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAccessRestrictionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAccessRestrictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

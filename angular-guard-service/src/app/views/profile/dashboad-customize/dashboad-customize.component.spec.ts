import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboadCustomizeComponent } from './dashboad-customize.component';

describe('DashboadCustomizeComponent', () => {
  let component: DashboadCustomizeComponent;
  let fixture: ComponentFixture<DashboadCustomizeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboadCustomizeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboadCustomizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

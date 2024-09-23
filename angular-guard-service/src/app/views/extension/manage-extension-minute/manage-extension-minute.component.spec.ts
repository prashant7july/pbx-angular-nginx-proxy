import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageExtensionMinuteComponent } from './manage-extension-minute.component';

describe('ManageExtensionMinuteComponent', () => {
  let component: ManageExtensionMinuteComponent;
  let fixture: ComponentFixture<ManageExtensionMinuteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageExtensionMinuteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageExtensionMinuteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

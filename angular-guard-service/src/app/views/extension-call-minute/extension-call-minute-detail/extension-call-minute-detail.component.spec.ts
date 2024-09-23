import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtensionCallMinuteDetailComponent } from './extension-call-minute-detail.component';

describe('ExtensionCallMinuteDetailComponent', () => {
  let component: ExtensionCallMinuteDetailComponent;
  let fixture: ComponentFixture<ExtensionCallMinuteDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtensionCallMinuteDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtensionCallMinuteDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

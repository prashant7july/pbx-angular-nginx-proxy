import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntercomAssociatedExtensionsComponent } from './intercom-associated-extensions.component';

describe('IntercomAssociatedExtensionsComponent', () => {
  let component: IntercomAssociatedExtensionsComponent;
  let fixture: ComponentFixture<IntercomAssociatedExtensionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntercomAssociatedExtensionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntercomAssociatedExtensionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

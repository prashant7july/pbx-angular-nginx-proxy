import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociatePromptComponent } from './associate-prompt.component';

describe('AssociatePromptComponent', () => {
  let component: AssociatePromptComponent;
  let fixture: ComponentFixture<AssociatePromptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociatePromptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociatePromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImGroupComponent } from './im-group.component';

describe('ImGroupComponent', () => {
  let component: ImGroupComponent;
  let fixture: ComponentFixture<ImGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

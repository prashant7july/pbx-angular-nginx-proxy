import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialoutGroupComponent } from './dialout-group.component';

describe('DialoutGroupComponent', () => {
  let component: DialoutGroupComponent;
  let fixture: ComponentFixture<DialoutGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialoutGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialoutGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

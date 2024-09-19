import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssigngroupComponent } from './assigngroup.component';

describe('AssigngroupComponent', () => {
  let component: AssigngroupComponent;
  let fixture: ComponentFixture<AssigngroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssigngroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssigngroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

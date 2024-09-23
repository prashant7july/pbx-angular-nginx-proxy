import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {ViewSupportUserComponent } from './view-supportgroup.component';

describe('ViewSupportUserComponent', () => {
  let component: ViewSupportUserComponent;
  let fixture: ComponentFixture<ViewSupportUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewSupportUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSupportUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewContactGroupComponent } from './view-contact-group.component';

describe('ViewContactGroupComponent', () => {
  let component: ViewContactGroupComponent;
  let fixture: ComponentFixture<ViewContactGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewContactGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewContactGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

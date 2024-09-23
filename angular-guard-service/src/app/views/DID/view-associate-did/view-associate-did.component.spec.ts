import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAssociateDIDComponent } from './view-associate-did.component';

describe('ViewAssociateDIDComponent', () => {
  let component: ViewAssociateDIDComponent;
  let fixture: ComponentFixture<ViewAssociateDIDComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAssociateDIDComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAssociateDIDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

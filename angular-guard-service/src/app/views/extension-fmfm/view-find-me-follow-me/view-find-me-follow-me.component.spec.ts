import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFindMeFollowMeComponent } from './view-find-me-follow-me.component';

describe('ViewFindMeFollowMeComponent', () => {
  let component: ViewFindMeFollowMeComponent;
  let fixture: ComponentFixture<ViewFindMeFollowMeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewFindMeFollowMeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewFindMeFollowMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

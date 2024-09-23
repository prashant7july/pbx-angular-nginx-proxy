import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFavoriteExtensionComponent } from './view-favorite-extension.component';

describe('ViewFavoriteExtensionComponent', () => {
  let component: ViewFavoriteExtensionComponent;
  let fixture: ComponentFixture<ViewFavoriteExtensionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewFavoriteExtensionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewFavoriteExtensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

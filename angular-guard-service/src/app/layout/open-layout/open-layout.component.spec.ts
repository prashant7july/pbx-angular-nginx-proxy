import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenLayoutComponent } from './open-layout.component';

describe('OpenLayoutComponent', () => {
  let component: OpenLayoutComponent;
  let fixture: ComponentFixture<OpenLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

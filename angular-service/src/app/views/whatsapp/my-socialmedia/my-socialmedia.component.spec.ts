import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MySocialmediaComponent } from './my-socialmedia.component';

describe('MySocialmediaComponent', () => {
  let component: MySocialmediaComponent;
  let fixture: ComponentFixture<MySocialmediaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MySocialmediaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MySocialmediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

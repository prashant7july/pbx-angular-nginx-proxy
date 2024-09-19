import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewApiConfigComponent } from './view-api-config.component';

describe('ViewApiConfigComponent', () => {
  let component: ViewApiConfigComponent;
  let fixture: ComponentFixture<ViewApiConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewApiConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewApiConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

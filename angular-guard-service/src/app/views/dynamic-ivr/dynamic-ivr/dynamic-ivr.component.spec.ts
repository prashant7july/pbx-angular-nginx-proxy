import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicIvrComponent } from './dynamic-ivr.component';

describe('DynamicIvrComponent', () => {
  let component: DynamicIvrComponent;
  let fixture: ComponentFixture<DynamicIvrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicIvrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicIvrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

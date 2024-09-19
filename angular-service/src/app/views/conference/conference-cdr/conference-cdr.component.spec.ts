import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConferenceCDRComponent } from './conference-cdr.component';

describe('ConferenceCDRComponent', () => {
  let component: ConferenceCDRComponent;
  let fixture: ComponentFixture<ConferenceCDRComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConferenceCDRComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConferenceCDRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociateIvrComponent } from './associate-ivr.component';

describe('AssociateIvrComponent', () => {
  let component: AssociateIvrComponent;
  let fixture: ComponentFixture<AssociateIvrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociateIvrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociateIvrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

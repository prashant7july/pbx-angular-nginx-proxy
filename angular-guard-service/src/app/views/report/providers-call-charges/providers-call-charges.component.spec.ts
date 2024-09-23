import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvidersCallChargesComponent } from './providers-call-charges.component';

describe('ProvidersCallChargesComponent', () => {
  let component: ProvidersCallChargesComponent;
  let fixture: ComponentFixture<ProvidersCallChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProvidersCallChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvidersCallChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

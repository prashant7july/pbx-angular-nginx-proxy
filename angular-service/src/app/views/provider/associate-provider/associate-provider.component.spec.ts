import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociateProviderComponent } from './associate-provider.component';

describe('AssociateProviderComponent', () => {
  let component: AssociateProviderComponent;
  let fixture: ComponentFixture<AssociateProviderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociateProviderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociateProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

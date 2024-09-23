import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtMappedDestinationComponent } from './ext-mapped-destination.component';

describe('ExtMappedDestinationComponent', () => {
  let component: ExtMappedDestinationComponent;
  let fixture: ComponentFixture<ExtMappedDestinationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtMappedDestinationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtMappedDestinationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

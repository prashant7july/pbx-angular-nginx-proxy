import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrunkRoutingComponent } from './trunk-routing.component';

describe('TrunkRoutingComponent', () => {
  let component: TrunkRoutingComponent;
  let fixture: ComponentFixture<TrunkRoutingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrunkRoutingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrunkRoutingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrunkListComponent } from './trunk-list.component';

describe('TrunkListComponent', () => {
  let component: TrunkListComponent;
  let fixture: ComponentFixture<TrunkListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrunkListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrunkListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

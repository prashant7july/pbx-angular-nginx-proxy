import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DidMappedHistoryComponent } from './did-mapped-history.component';

describe('DidMappedHistoryComponent', () => {
  let component: DidMappedHistoryComponent;
  let fixture: ComponentFixture<DidMappedHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DidMappedHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DidMappedHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockedIpComponent } from './blocked-ip.component';

describe('BlockedIpComponent', () => {
  let component: BlockedIpComponent;
  let fixture: ComponentFixture<BlockedIpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockedIpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockedIpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

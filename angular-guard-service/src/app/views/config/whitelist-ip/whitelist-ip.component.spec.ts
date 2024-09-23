import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhitelistIpComponent } from './whitelist-ip.component';

describe('WhitelistIpComponent', () => {
  let component: WhitelistIpComponent;
  let fixture: ComponentFixture<WhitelistIpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhitelistIpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhitelistIpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

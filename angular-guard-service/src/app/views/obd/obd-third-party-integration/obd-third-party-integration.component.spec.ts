import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObdThirdPartyIntegrationComponent } from './obd-third-party-integration.component';

describe('ObdThirdPartyIntegrationComponent', () => {
  let component: ObdThirdPartyIntegrationComponent;
  let fixture: ComponentFixture<ObdThirdPartyIntegrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObdThirdPartyIntegrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObdThirdPartyIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

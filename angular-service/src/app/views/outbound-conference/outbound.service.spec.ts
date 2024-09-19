import { TestBed } from '@angular/core/testing';

import { OutboundService } from './outbound.service';

describe('OutboundService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OutboundService = TestBed.get(OutboundService);
    expect(service).toBeTruthy();
  });
});

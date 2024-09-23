import { TestBed } from '@angular/core/testing';

import { CustomerDialoutServiceService } from './customer-dialout-service.service';

describe('CustomerDialoutServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CustomerDialoutServiceService = TestBed.get(CustomerDialoutServiceService);
    expect(service).toBeTruthy();
  });
});

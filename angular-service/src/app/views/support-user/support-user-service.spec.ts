import { TestBed } from '@angular/core/testing';

import { SupportUserService } from './support-user-service';

describe('SupportUserService.TsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SupportUserService = TestBed.get(SupportUserService);
    expect(service).toBeTruthy();
  });
});

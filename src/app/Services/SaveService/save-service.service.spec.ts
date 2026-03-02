import { TestBed } from '@angular/core/testing';

import { SaveServiceService } from './save-service.service';

describe('SaveServiceService', () => {
  let service: SaveServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaveServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

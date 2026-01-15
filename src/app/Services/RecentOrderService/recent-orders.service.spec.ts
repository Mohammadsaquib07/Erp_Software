import { TestBed } from '@angular/core/testing';

import { RecentOrdersService } from './recent-orders.service';

describe('RecentOrdersService', () => {
  let service: RecentOrdersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecentOrdersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { Warehouses } from './warehouses';

describe('Warehouses', () => {
  let service: Warehouses;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Warehouses);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

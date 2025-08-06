// ===============================
// 3. SPEC SERVICIO - src/app/branches/services/branch.spec.ts
// ===============================

import { TestBed } from '@angular/core/testing';
import { BranchService } from './branches';

describe('BranchService', () => {
  let service: BranchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BranchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return initial branches', (done) => {
    service.getBranches().subscribe(branches => {
      expect(branches.length).toBe(8);
      expect(branches[0].name).toBe('Sucursal Centro');
      done();
    });
  });

  it('should create a new branch', (done) => {
    const newBranchData = {
      name: 'Test Branch',
      code: 'TEST001',
      address: 'Test Address',
      city: 'Test City',
      phone: '123-456-7890',
      manager: 'Test Manager',
      status: 'Activa' as const
    };

    service.createBranch(newBranchData).subscribe(Branches => {
      expect(Branches.name).toBe('Test Branch');
      expect(Branches.id).toBeDefined();
      done();
    });
  });
});
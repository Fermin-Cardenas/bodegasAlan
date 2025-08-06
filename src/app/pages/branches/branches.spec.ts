// ===============================
// 5. SPEC COMPONENTE - src/app/branches/branches.spec.ts
// ===============================

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BranchesComponent } from './branches';

describe('BranchesComponent', () => {
  let component: BranchesComponent;
  let fixture: ComponentFixture<BranchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BranchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty search term', () => {
    component.searchTerm$.subscribe(term => {
      expect(term).toBe('');
    });
  });

  it('should update search term', () => {
    const testTerm = 'test search';
    component.onSearchChange(testTerm);
    
    component.searchTerm$.subscribe(term => {
      expect(term).toBe(testTerm);
    });
  });
});
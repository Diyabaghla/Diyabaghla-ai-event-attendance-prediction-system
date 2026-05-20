import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Navbar } from '../../src/app/components/shared/navbar/navbar';

describe('Navbar Component', () => {
  let comp: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar] // standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Creation ─────────────────────────────

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  // ─── Basic sanity test ─────────────────────

  it('should have empty template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.innerHTML).toBe('');
  });
});
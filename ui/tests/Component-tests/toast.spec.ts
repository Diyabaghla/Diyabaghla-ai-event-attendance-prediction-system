import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Toast } from '../../src/app/components/shared/toast/toast';
import { ToastService, Toastt } from '../../src/app/services/toast.service';
import { of } from 'rxjs';

describe('Toast Component', () => {
  let comp: Toast;
  let fixture: ComponentFixture<Toast>;

  const mockToastService = {
    dismiss: jasmine.createSpy('dismiss'),
    toasts$: of([
      { id: 1, message: 'Test 1', type: 'success' },
      { id: 2, message: 'Test 2', type: 'error' }
    ])
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Toast],
      providers: [
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Toast);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Creation ─────────────────────────────

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  // ─── dismiss() ─────────────────────────────

  it('should call toastSvc.dismiss with correct id', () => {
    comp.dismiss(1);
    expect(mockToastService.dismiss).toHaveBeenCalledWith(1);
  });

  // ─── trackById() ───────────────────────────

  it('trackById should return toast id', () => {
    const toast: Toastt = { id: 10, message: 'Hello', type: 'success' } as any;
    const result = comp.trackById(0, toast);
    expect(result).toBe(10);
  });
});
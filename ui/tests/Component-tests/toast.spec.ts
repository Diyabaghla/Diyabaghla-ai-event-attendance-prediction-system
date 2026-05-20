// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { Toast } from '../../src/app/components/shared/toast/toast';
// import { ToastService } from '../../src/app/services/toast.service';

// describe('Toast Component', () => {
//   let comp: Toast;
//   let fix:  ComponentFixture<Toast>;
//   let toastSvc: ToastService;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [Toast]
//     }).compileComponents();

//     fix      = TestBed.createComponent(Toast);
//     comp     = fix.componentInstance;
//     toastSvc = TestBed.inject(ToastService);
//     fix.detectChanges();
//   });

//   it('should create',                   () => expect(comp).toBeTruthy());
//   it('starts with empty toasts array',  () => expect(comp.toasts.length).toBe(0));

//   it('success toast adds to array', fakeAsync(() => {
//     toastSvc.success('Test success!');
//     tick();
//     fix.detectChanges();
//     expect(comp.toasts.length).toBe(1);
//     expect(comp.toasts[0].message).toBe('Test success!');
//     expect(comp.toasts[0].type).toBe('success');
//   }));

//   it('error toast adds with error type', fakeAsync(() => {
//     toastSvc.error('Something failed');
//     tick();
//     fix.detectChanges();
//     expect(comp.toasts[0].type).toBe('error');
//   }));

//   it('info toast adds with info type', fakeAsync(() => {
//     toastSvc.info('Just so you know');
//     tick();
//     fix.detectChanges();
//     expect(comp.toasts[0].type).toBe('info');
//   }));

//   it('dismiss removes toast by id', fakeAsync(() => {
//     toastSvc.success('Dismiss me');
//     tick(); fix.detectChanges();
//     const id = comp.toasts[0].id;
//     comp.dismiss(id);
//     fix.detectChanges();
//     expect(comp.toasts.find(t => t.id === id)).toBeUndefined();
//   }));

//   it('toast auto-dismisses after duration', fakeAsync(() => {
//     toastSvc.success('Auto dismiss');
//     tick();
//     fix.detectChanges();
//     expect(comp.toasts.length).toBe(1);
//     tick(4000);
//     fix.detectChanges();
//     expect(comp.toasts.length).toBe(0);
//   }));

//   it('multiple toasts stack', fakeAsync(() => {
//     toastSvc.success('First');
//     toastSvc.error('Second');
//     toastSvc.info('Third');
//     tick(); fix.detectChanges();
//     expect(comp.toasts.length).toBe(3);
//   }));

//   it('trackById returns toast id', () => {
//     const toast = { id: 99, message: 'test', type: 'success' as const };
//     expect(comp.trackById(0, toast as any)).toBe(99);
//   });
// });
// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { Toast } from '../../src/app/components/shared/toast/toast';
// import { ToastService } from '../../src/app/services/toast.service';

// describe('Toast Component', () => {
//   let comp:     Toast;
//   let fix:      ComponentFixture<Toast>;
//   let toastSvc: ToastService;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({ imports: [Toast] }).compileComponents();
//     fix      = TestBed.createComponent(Toast);
//     comp     = fix.componentInstance;
//     toastSvc = TestBed.inject(ToastService);
//     fix.detectChanges();
//   });

//   it('should create',                () => expect(comp).toBeTruthy());
//   it('starts with empty toasts',     () => expect(comp.toasts.length).toBe(0));

//   it('success toast adds to array', fakeAsync(() => {
//     toastSvc.success('Test!'); tick(); fix.detectChanges();
//     expect(comp.toasts.length).toBe(1);
//     expect(comp.toasts[0].message).toBe('Test!');
//     expect(comp.toasts[0].type).toBe('success');
//   }));

//   it('error toast adds with error type', fakeAsync(() => {
//     toastSvc.error('Fail'); tick(); fix.detectChanges();
//     expect(comp.toasts[0].type).toBe('error');
//   }));

//   it('dismiss removes toast', fakeAsync(() => {
//     toastSvc.success('Remove me'); tick(); fix.detectChanges();
//     const id = comp.toasts[0].id;
//     comp.dismiss(id); fix.detectChanges();
//     expect(comp.toasts.find((t: any) => t.id === id)).toBeUndefined();
//   }));

//   it('toast auto-dismisses after duration', fakeAsync(() => {
//     toastSvc.success('Auto'); tick(); fix.detectChanges();
//     tick(4000); fix.detectChanges();
//     expect(comp.toasts.length).toBe(0);
//   }));

//   it('multiple toasts stack', fakeAsync(() => {
//     toastSvc.success('1'); toastSvc.error('2'); tick(); fix.detectChanges();
//     expect(comp.toasts.length).toBe(2);
//   }));
// });
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
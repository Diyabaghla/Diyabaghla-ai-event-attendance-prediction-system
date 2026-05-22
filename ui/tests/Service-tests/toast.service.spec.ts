import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService, ToastType } from '../../src/app/services/toast.service';
 
describe('ToastService', () => {
  let svc: ToastService;
 
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ToastService] });
    svc = TestBed.inject(ToastService);
  });
 
  // ── Creation ──────────────────────────────────────────────
  it('should be created', () => expect(svc).toBeTruthy());
 
  it('toasts$ starts as empty array', (done) => {
    svc.toasts$.subscribe(toasts => {
      expect(toasts.length).toBe(0);
      done();
    });
  });
 
  // ── show() ────────────────────────────────────────────────
  it('show() adds a toast to toasts$', (done) => {
    svc.show('Test message');
    svc.toasts$.subscribe(toasts => {
      expect(toasts.length).toBe(1);
      done();
    });
  });
 
  it('show() sets correct message', (done) => {
    svc.show('Hello World');
    svc.toasts$.subscribe(toasts => {
      expect(toasts[0].message).toBe('Hello World');
      done();
    });
  });
 
  it('show() defaults to success type', (done) => {
    svc.show('Test');
    svc.toasts$.subscribe(toasts => {
      expect(toasts[0].type).toBe('success');
      done();
    });
  });
 
  it('show() sets the specified type', (done) => {
    svc.show('Error msg', 'error');
    svc.toasts$.subscribe(toasts => {
      expect(toasts[0].type).toBe('error');
      done();
    });
  });
 
  it('show() assigns a unique id', (done) => {
    svc.show('First');
    svc.show('Second');
    svc.toasts$.subscribe(toasts => {
      expect(toasts[0].id).not.toBe(toasts[1].id);
      done();
    });
  });
 
  it('show() ids are incremental', (done) => {
    svc.show('First');
    svc.show('Second');
    svc.toasts$.subscribe(toasts => {
      expect(toasts[1].id).toBeGreaterThan(toasts[0].id);
      done();
    });
  });
 
  it('show() sets correct icon for success', (done) => {
    svc.show('Test', 'success');
    svc.toasts$.subscribe(toasts => {
      expect(toasts[0].icon).toBe('✓');
      done();
    });
  });
 
  it('show() sets correct icon for error', (done) => {
    svc.show('Test', 'error');
    svc.toasts$.subscribe(toasts => {
      expect(toasts[0].icon).toBe('✕');
      done();
    });
  });
 
  it('show() sets correct icon for info', (done) => {
    svc.show('Test', 'info');
    svc.toasts$.subscribe(toasts => {
      expect(toasts[0].icon).toBe('ℹ');
      done();
    });
  });
 
  it('show() sets correct icon for warning', (done) => {
    svc.show('Test', 'warning');
    svc.toasts$.subscribe(toasts => {
      expect(toasts[0].icon).toBe('⚠');
      done();
    });
  });
 
  it('multiple show() calls stack toasts', (done) => {
    svc.show('First');
    svc.show('Second');
    svc.show('Third');
    svc.toasts$.subscribe(toasts => {
      expect(toasts.length).toBe(3);
      done();
    });
  });
 
  it('show() auto-dismisses after default duration', fakeAsync(() => {
    svc.show('Auto dismiss');
    let count = 0;
    svc.toasts$.subscribe(t => count = t.length);
    expect(count).toBe(1);
    tick(3500);
    expect(count).toBe(0);
  }));
 
  it('show() auto-dismisses after custom duration', fakeAsync(() => {
    svc.show('Custom', 'info', 2000);
    let count = 0;
    svc.toasts$.subscribe(t => count = t.length);
    expect(count).toBe(1);
    tick(1999);
    expect(count).toBe(1);  // still visible
    tick(1);
    expect(count).toBe(0);  // now dismissed
  }));
 
  // ── success() ─────────────────────────────────────────────
  it('success() adds success toast', (done) => {
    svc.success('Great job!');
    svc.toasts$.subscribe(toasts => {
      expect(toasts[0].type).toBe('success');
      expect(toasts[0].message).toBe('Great job!');
      done();
    });
  });
 
  it('success() sets ✓ icon', (done) => {
    svc.success('Done');
    svc.toasts$.subscribe(toasts => {
      expect(toasts[0].icon).toBe('✓');
      done();
    });
  });
 
  it('success() auto-dismisses after 3500ms', fakeAsync(() => {
    svc.success('Auto');
    let count = 0;
    svc.toasts$.subscribe(t => count = t.length);
    tick(3500);
    expect(count).toBe(0);
  }));
 
  // ── error() ───────────────────────────────────────────────
  it('error() adds error toast', (done) => {
    svc.error('Something broke!');
    svc.toasts$.subscribe(toasts => {
      expect(toasts[0].type).toBe('error');
      expect(toasts[0].message).toBe('Something broke!');
      done();
    });
  });
 
  it('error() sets ✕ icon', (done) => {
    svc.error('Fail');
    svc.toasts$.subscribe(toasts => {
      expect(toasts[0].icon).toBe('✕');
      done();
    });
  });
 
  it('error() stays longer — auto-dismisses after 5000ms', fakeAsync(() => {
    svc.error('Error');
    let count = 0;
    svc.toasts$.subscribe(t => count = t.length);
    tick(3500);
    expect(count).toBe(1);   // still visible at 3.5s
    tick(1500);
    expect(count).toBe(0);   // gone at 5s
  }));
 
  // ── info() ────────────────────────────────────────────────
  it('info() adds info toast', (done) => {
    svc.info('Just FYI');
    svc.toasts$.subscribe(toasts => {
      expect(toasts[0].type).toBe('info');
      expect(toasts[0].message).toBe('Just FYI');
      done();
    });
  });
 
  it('info() sets ℹ icon', (done) => {
    svc.info('Note');
    svc.toasts$.subscribe(toasts => {
      expect(toasts[0].icon).toBe('ℹ');
      done();
    });
  });
 
  it('info() auto-dismisses after 3500ms', fakeAsync(() => {
    svc.info('Info');
    let count = 0;
    svc.toasts$.subscribe(t => count = t.length);
    tick(3500);
    expect(count).toBe(0);
  }));
 
  // ── warning() ─────────────────────────────────────────────
  it('warning() adds warning toast', (done) => {
    svc.warning('Be careful!');
    svc.toasts$.subscribe(toasts => {
      expect(toasts[0].type).toBe('warning');
      expect(toasts[0].message).toBe('Be careful!');
      done();
    });
  });
 
  it('warning() sets ⚠ icon', (done) => {
    svc.warning('Warn');
    svc.toasts$.subscribe(toasts => {
      expect(toasts[0].icon).toBe('⚠');
      done();
    });
  });
 
  // ── dismiss() ─────────────────────────────────────────────
  it('dismiss() removes toast by id', (done) => {
    svc.show('Remove me');
    svc.toasts$.subscribe(toasts => {
      if (toasts.length === 1) {
        const id = toasts[0].id;
        svc.dismiss(id);
      }
    });
    setTimeout(() => {
      svc.toasts$.subscribe(toasts => {
        expect(toasts.length).toBe(0);
        done();
      });
    }, 10);
  });
 
  it('dismiss() only removes matching id', (done) => {
    svc.show('Keep me');
    svc.show('Remove me');
    let removeId: number;
    svc.toasts$.subscribe(toasts => {
      if (toasts.length === 2) {
        removeId = toasts[1].id;
        svc.dismiss(removeId);
      }
    });
    setTimeout(() => {
      svc.toasts$.subscribe(toasts => {
        expect(toasts.length).toBe(1);
        expect(toasts[0].message).toBe('Keep me');
        done();
      });
    }, 10);
  });
 
  it('dismiss() with unknown id does nothing', (done) => {
    svc.show('Still here');
    svc.dismiss(999999);
    svc.toasts$.subscribe(toasts => {
      expect(toasts.length).toBe(1);
      done();
    });
  });
 
  it('dismiss() on empty list does nothing', () => {
    expect(() => svc.dismiss(1)).not.toThrow();
  });
 
  it('dismiss() multiple toasts one by one', fakeAsync(() => {
    svc.show('A'); svc.show('B'); svc.show('C');
    let toasts: any[] = [];
    svc.toasts$.subscribe(t => toasts = t);
    expect(toasts.length).toBe(3);
    svc.dismiss(toasts[0].id);
    expect(toasts.length).toBe(2);
    svc.dismiss(toasts[0].id);
    expect(toasts.length).toBe(1);
    svc.dismiss(toasts[0].id);
    expect(toasts.length).toBe(0);
    tick(5000); // flush timers
  }));
 
  // ── Mixed scenarios ───────────────────────────────────────
  it('mixed types stack correctly', (done) => {
    svc.success('OK'); svc.error('Fail'); svc.info('Note'); svc.warning('Warn');
    svc.toasts$.subscribe(toasts => {
      expect(toasts.length).toBe(4);
      expect(toasts.map(t => t.type)).toEqual(['success', 'error', 'info', 'warning']);
      done();
    });
  });
 
  it('toasts$ is observable (BehaviorSubject)', () => {
    let emitted = false;
    svc.toasts$.subscribe(() => emitted = true);
    expect(emitted).toBeTrue();
  });
 
  it('counter increments for each toast', (done) => {
    svc.show('1'); svc.show('2'); svc.show('3');
    svc.toasts$.subscribe(toasts => {
      expect(toasts.length).toBe(3);
      // IDs should be 1, 2, 3
      expect(toasts[0].id).toBe(1);
      expect(toasts[1].id).toBe(2);
      expect(toasts[2].id).toBe(3);
      done();
    });
  });
});
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// Initialize Angular testing environment
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// ✅ Manually import your test files 

import '../tests/Component-tests/user-attendance-prediction.spec';
import '../tests/Component-tests/dashboard.spec';
import '../tests/Component-tests/events.spec';
import '../tests/Component-tests/navbar.spec';
import '../tests/Component-tests/notification-bell.spec';
import '../tests/Component-tests/registrations.spec';
import '../tests/Component-tests/reports.spec';
import '../tests/Component-tests/shell.spec';
import '../tests/Component-tests/toast.spec';
import '../tests/Component-tests/login.spec';
import '../tests/Component-tests/landing.spec';
import '../tests/Component-tests/resource-planning.spec';
import '../tests/Component-tests/no-show-prediction.spec';
import '../tests/Component-tests/signup.spec';

// import '../tests/auth.service.spec';
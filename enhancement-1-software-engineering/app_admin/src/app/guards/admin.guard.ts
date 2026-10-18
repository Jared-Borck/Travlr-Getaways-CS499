import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthenticationService } from '../services/authentication';

export const adminGuard: CanActivateFn = () => {
  const authenticationService = inject(AuthenticationService);
  const router = inject(Router);

  // User is not logged in.
  if (!authenticationService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  // User is logged in but is not an administrator.
  if (!authenticationService.isAdmin()) {
    return router.createUrlTree(['/']);
  }

  // User is authenticated and has the admin role.
  return true;
};

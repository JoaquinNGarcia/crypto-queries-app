import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.authStatus$.pipe(
    take(1),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    })
  );
};

export const redirectIfAuthenticatedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.authStatus$.pipe(
    take(1),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        router.navigate(['/dashboard']);
        return false;
      }
      return true;
    })
  );
};
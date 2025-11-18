import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const session = await authService.getSession();
  
  if (!session) {
    router.navigate(['/login']);
    return false;
  }

  // Only allow admin users to access dashboard
  if (session.userType !== 'admin') {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check session from server
  try {
    const session = await firstValueFrom(authService.checkSession());
    
    if (!session || !session.authenticated) {
      router.navigate(['/login']);
      return false;
    }

    // Only allow admin users to access dashboard
    if (session.userType !== 'admin') {
      router.navigate(['/login']);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Auth guard error:', error);
    router.navigate(['/login']);
    return false;
  }
};

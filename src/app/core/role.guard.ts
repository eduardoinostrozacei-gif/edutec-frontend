import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';


export const RoleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const required = (route.data?.['roles'] as string[]) ?? [];

  return auth.ensureRoles().then(() => {

    if (required.length === 0) return true;


    if (auth.hasAnyRole(required)) return true;

    router.navigate(['/panel']);
    return false;
  });
};

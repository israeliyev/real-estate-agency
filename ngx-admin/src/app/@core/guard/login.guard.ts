import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const loginGuard = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    return false;
    router.navigate(['/pages/users']);
  }

  return true;
};

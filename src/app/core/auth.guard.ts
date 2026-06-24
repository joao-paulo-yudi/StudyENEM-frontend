import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StudentService } from './student.service';

/** Protege rotas internas: redireciona para /login quando não autenticado. */
export const authGuard: CanActivateFn = () => {
  const student = inject(StudentService);
  const router = inject(Router);
  return student.isLoggedIn ? true : router.createUrlTree(['/login']);
};

/** Mantém usuários já logados longe da tela de login. */
export const loginGuard: CanActivateFn = () => {
  const student = inject(StudentService);
  const router = inject(Router);
  return student.isLoggedIn ? router.createUrlTree(['/home']) : true;
};

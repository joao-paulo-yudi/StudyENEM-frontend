import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { StudentService } from './student.service';

/** Anexa o token JWT às chamadas da API e encerra a sessão quando o token é recusado (401). */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(StudentService);
  const router = inject(Router);

  const isApi = req.url.startsWith(environment.apiUrl);
  const token = session.token;
  const request = isApi && token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      if (isApi && err.status === 401 && !req.url.includes('/auth/')) {
        session.clear();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};

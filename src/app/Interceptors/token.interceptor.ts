import { HttpInterceptorFn } from '@angular/common/http';
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('JWT_TOKEN');
  if (token) {
    const reqClone = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(reqClone);
  }
  return next(req);
};
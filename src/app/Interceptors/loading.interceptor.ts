import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingServiceService } from '../Services/loading-service.service';
import { finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingServiceService);
  loadingService.show();

  return next(req).pipe(
    finalize(
      () =>
        loadingService.hide()
    )
  );
};

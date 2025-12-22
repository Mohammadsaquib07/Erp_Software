import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
 import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from './app/Interceptors/token.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([tokenInterceptor]) // Register it here
    )
  ]
});

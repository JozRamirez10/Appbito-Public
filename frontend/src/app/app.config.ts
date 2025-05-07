import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { habitReducer } from './store/habit/habits.reducer';
import { HabitsEffects } from './store/habit/habits.effects';
import { userReducer } from './store/user/user.reducer';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { UserEffects } from './store/user/user.effects';
import { authReducer } from './store/auth/auth.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { tokenInterceptor } from './interceptors/token.interceptor';
import { AuthService } from './services/auth.service';
import { loadingReducer } from './store/loading/loading.reducer';
import { habitProgressReducer } from './store/habitProgress/habit.progress.reducer';
import { HabitProgressEffects } from './store/habitProgress/habit.progress.effects';
import { habitProgressMonthlyReducer } from './store/habitProgressMonthly/habit.progress.month.reducer';
import { HabitProgressMonthlyEffects } from './store/habitProgressMonthly/habit.progress.month.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return authService.refreshToken();
    }),
    provideRouter(routes), 
    provideHttpClient(withInterceptors([tokenInterceptor])),
    provideStore({
      habits: habitReducer,
      habitProgress: habitProgressReducer,
      habitProgressMonthly: habitProgressMonthlyReducer,
      users: userReducer,
      auth: authReducer,
      loading: loadingReducer
    }), 
    provideEffects(
      HabitsEffects,
      HabitProgressEffects,
      HabitProgressMonthlyEffects,
      UserEffects,
      AuthEffects
    ),
  ]
};

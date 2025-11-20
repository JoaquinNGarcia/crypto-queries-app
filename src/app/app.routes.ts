import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TrendingComponent } from './pages/trending/trending.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard, redirectIfAuthenticatedGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent, canActivate: [redirectIfAuthenticatedGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'trending', component: TrendingComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];

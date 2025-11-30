import { Routes } from '@angular/router';
import { TodosPage } from './pages/todos/todos';
import { LoginPage } from './pages/login/login';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: '', component: TodosPage, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];

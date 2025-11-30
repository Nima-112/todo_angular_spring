import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatCardModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  username = signal('');
  password = signal('');
  isLoading = signal(false);
  error = signal('');

  login() {
    this.isLoading.set(true);
    this.error.set('');
    this.auth.login(this.username(), this.password()).subscribe({
      next: (res) => { this.auth.setToken(res.token); this.router.navigateByUrl('/'); },
      error: (err) => {
        if (err.status === 0) this.error.set('Serveur indisponible (connexion refusée)');
        else if (err.status === 401) this.error.set('Identifiants invalides');
        else this.error.set('Erreur lors de la connexion');
        this.isLoading.set(false);
      }
    });
  }

  register() {
    this.isLoading.set(true);
    this.error.set('');
    this.auth.register(this.username(), this.password()).subscribe({
      next: (res) => { this.auth.setToken(res.token); this.router.navigateByUrl('/'); },
      error: (err) => {
        if (err.status === 0) this.error.set('Serveur indisponible (connexion refusée)');
        else if (err.status === 400) this.error.set('Nom d’utilisateur déjà utilisé');
        else this.error.set('Erreur lors de l’inscription');
        this.isLoading.set(false);
      }
    });
  }
}

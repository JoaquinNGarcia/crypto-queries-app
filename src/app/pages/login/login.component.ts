import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';

interface FormState {
  username: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  protected formData: FormState = {
    username: '',
    email: '',
    password: '',
  };

  protected isRegistering = false;
  protected successMessage = '';
  protected lastPayload: FormState | null = null;
  protected authError = '';
  protected loading = false;
  protected readonly user$ = this.authService.user$;
  protected readonly isLoggedIn$ = this.authService.authStatus$;

  constructor() {
    this.user$
      .pipe(takeUntilDestroyed())
      .subscribe(user => {
        if (user) {
          this.router.navigate(['/dashboard']);
        }
      });
  }
  
  handleSubmit(form: NgForm): void {
    if (form.invalid) {
      this.successMessage = '';
      return;
    }

    this.lastPayload = { ...this.formData };
    this.loading = true;
    this.authError = '';

    if (this.isRegistering) {
      this.register(form);
    } else {
      this.login(form);
    }
  }

  private login(form: NgForm) {
    this.authService.saveLoginAttempt(this.formData).subscribe({
      error: (err) => console.warn('No se pudo registrar el acceso en Firestore', err),
    });

    this.authService.login(this.formData.email, this.formData.password).subscribe({
      next: () => {
        this.successMessage = `Hola ${this.formData.email}, login exitoso`;
        this.resetForm(form);
        this.cdr.markForCheck();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        if (err?.code === 'auth/user-not-found') {
          this.isRegistering = true;
          this.register(form);
          return;
        }
        this.loading = false;
        this.authError = this.mapFirebaseError(err);
        this.cdr.markForCheck();
      },
    });
  }

  private register(form: NgForm) {
    this.authService
      .register(this.formData.email, this.formData.password, this.formData.username)
      .subscribe({
        next: () => {
          this.successMessage = `Usuario ${this.formData.email} creado correctamente`;
          this.isRegistering = false;
          this.resetForm(form);
          this.router.navigate(['/dashboard']);
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.loading = false;
          this.authError = this.mapFirebaseError(err);
          this.cdr.markForCheck();
          console.error('Registro falló', err);
        },
      });
  }

  private resetForm(form: NgForm) {
    this.loading = false;

    form.resetForm();
    this.formData = { username: '', email: '', password: '' };
  }

  protected logout(): void {
    this.authService.logout().subscribe();
  }

  private mapFirebaseError(err: any): string {
    if (!err) return 'Error desconocido.';
    switch (err.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'Credenciales inválidas.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/email-already-in-use':
        return 'El email ya se encuentra registrado.';
      default:
        return err.message ?? 'Ocurrió un error con Firebase Auth.';
    }
  }

  protected toggleMode(): void {
    this.isRegistering = !this.isRegistering;
    this.successMessage = '';
    this.authError = '';
    this.cdr.markForCheck();
  }
}

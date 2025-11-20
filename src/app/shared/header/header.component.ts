import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
interface NavLink {
  label: string;
  path: string;
  exact?: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf, AsyncPipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly navLinks: NavLink[] = [
    { label: 'Dashboard', path: '/', exact: true },
    { label: 'Trending', path: '/trending' },
  ];

  readonly isLoggedIn$ = this.authService.authStatus$;

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}

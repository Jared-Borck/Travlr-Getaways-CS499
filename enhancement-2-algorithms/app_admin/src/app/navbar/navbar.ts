import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../services/authentication';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  public isLoggedIn$: Observable<boolean>;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {
    this.isLoggedIn$ = this.authenticationService.authState$;
  }

  public onLogout(): void {
    this.authenticationService.logout();
    this.router.navigate(['/']);
  }
}

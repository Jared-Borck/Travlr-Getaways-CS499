import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { BROWSER_STORAGE } from '../storage';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { TripData } from './trip-data';

interface JwtPayload {
  _id?: string;
  email?: string;
  name?: string;
  role?: string;
  exp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  authResp: AuthResponse = new AuthResponse();

  private authStateSubject = new BehaviorSubject<boolean>(false);
  public authState$ = this.authStateSubject.asObservable();

  private adminStateSubject = new BehaviorSubject<boolean>(false);
  public adminState$ = this.adminStateSubject.asObservable();

  constructor(
    @Inject(BROWSER_STORAGE) private storage: Storage,
    private tripDataService: TripData
  ) {
    this.authStateSubject.next(this.isLoggedIn());
    this.adminStateSubject.next(this.isAdmin());
  }

  public getToken(): string {
    const token = this.storage.getItem('travlr-token');

    if (!token) {
      return '';
    }

    return token;
  }

  public saveToken(token: string): void {
    this.storage.setItem('travlr-token', token);

    this.authStateSubject.next(this.isLoggedIn());
    this.adminStateSubject.next(this.isAdmin());
  }

  public logout(): void {
    this.storage.removeItem('travlr-token');

    this.authStateSubject.next(false);
    this.adminStateSubject.next(false);
  }

  private decodeToken(): JwtPayload | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      const parts = token.split('.');

      if (parts.length !== 3) {
        return null;
      }

      let payload = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      while (payload.length % 4) {
        payload += '=';
      }

      return JSON.parse(atob(payload)) as JwtPayload;

    } catch {
      return null;
    }
  }

  public isLoggedIn(): boolean {
    const payload = this.decodeToken();

    if (!payload || !payload.exp) {
      return false;
    }

    return payload.exp > (Date.now() / 1000);
  }

  public isAdmin(): boolean {
    const payload = this.decodeToken();

    if (!payload || !payload.exp) {
      return false;
    }

    if (payload.exp <= (Date.now() / 1000)) {
      return false;
    }

    return payload.role === 'admin';
  }

  public getCurrentUserId(): string {
    const payload = this.decodeToken();

    if (!payload || !payload._id) {
      return '';
    }

    return payload._id;
  }

  public getCurrentUser(): User | null {
    const payload = this.decodeToken();

    if (!payload || !payload.email || !payload.name) {
      return null;
    }

    return {
      email: payload.email,
      name: payload.name,
      role: payload.role || 'customer'
    } as User;
  }

  public login(user: User, passwd: string): void {
    this.tripDataService.login(user, passwd)
      .subscribe({
        next: (value: AuthResponse) => {
          if (value && value.token) {
            this.authResp = value;
            this.saveToken(this.authResp.token);
          }
        },
        error: (error: any) => {
          console.error('Login failed:', error);

          this.authStateSubject.next(false);
          this.adminStateSubject.next(false);
        }
      });
  }

  public register(user: User, passwd: string): void {
    this.tripDataService.register(user, passwd)
      .subscribe({
        next: (value: AuthResponse) => {
          if (value && value.token) {
            this.authResp = value;
            this.saveToken(this.authResp.token);
          }
        },
        error: (error: any) => {
          console.error('Registration failed:', error);

          this.authStateSubject.next(false);
          this.adminStateSubject.next(false);
        }
      });
  }
}

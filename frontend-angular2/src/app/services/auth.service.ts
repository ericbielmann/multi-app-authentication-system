import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { of } from 'rxjs';

export interface UserSession {
  authenticated: boolean;
  userType?: string;
  name?: string;
  email?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5001/api/auth';
  private sessionSubject = new BehaviorSubject<UserSession | null>(null);
  public session$ = this.sessionSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkSession().subscribe({
      error: (err) => {
        console.error('Session check failed:', err);
        this.sessionSubject.next({ authenticated: false });
      }
    });
  }

  login(request: LoginRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/admin`, request, { withCredentials: true })
      .pipe(
        tap(response => {
          this.checkSession().subscribe();
        })
      );
  }

  checkSession(): Observable<UserSession> {
    return this.http.get<UserSession>(`${this.apiUrl}/session`, { withCredentials: true })
      .pipe(
        tap(session => {
          this.sessionSubject.next(session);
          if (!session.authenticated && !this.router.url.includes('login')) {
            this.router.navigate(['/login']);
          }
        }),
        catchError(err => {
          console.error('Session check error:', err);
          this.sessionSubject.next({ authenticated: false });
          return of({ authenticated: false });
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.sessionSubject.next(null);
          this.router.navigate(['/login']);
        })
      );
  }

  getSession(): UserSession | null {
    return this.sessionSubject.value;
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface UserSession {
  authenticated: boolean;
  userType?: string;
  name?: string;
  email?: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5001/api/auth';
  private sessionSubject = new BehaviorSubject<UserSession | null>(null);
  public session$ = this.sessionSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkSession().subscribe({
      error: (err) => {
        console.error('Session check failed:', err);
        this.sessionSubject.next({ authenticated: false });
      }
    });
  }

  checkSession(): Observable<UserSession> {
    return this.http.get<UserSession>(`${this.apiUrl}/session`, { withCredentials: true })
      .pipe(
        tap(session => {
          this.sessionSubject.next(session);
        })
      );
  }

  getSession(): UserSession | null {
    return this.sessionSubject.value;
  }
}

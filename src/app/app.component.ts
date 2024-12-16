import { Component } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { firebaseConfig } from '../environments/firebase-config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  auth;

  constructor() {
    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
  }

  // Method to log in with email and password
  login(email: string, password: string): Promise<void> {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then(() => {
        console.log('User logged in');
      })
      .catch(error => {
        console.error('Error logging in:', error);
      });
  }

  // Method to log out
  logout(): Promise<void> {
    return signOut(this.auth)
      .then(() => {
        console.log('User logged out');
      })
      .catch(error => {
        console.error('Error logging out:', error);
      });
  }

  // Method to observe authentication state
  authStateObserver(): void {
    onAuthStateChanged(this.auth, user => {
      if (user) {
        console.log('User is logged in:', user);
      } else {
        console.log('User is logged out');
      }
    });
  }

  onLogin(event: Event): void {
    event.preventDefault();
    const target = event.target as HTMLFormElement;
    const emailInput = target.querySelector<HTMLInputElement>('#email')!;
    const passwordInput = target.querySelector<HTMLInputElement>('#password')!;

    const email = emailInput.value;
    const password = passwordInput.value;

    this.login(email, password);
  }

  ngOnInit(): void {
    this.authStateObserver();
  }
}


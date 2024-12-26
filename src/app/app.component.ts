import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../environments/firebase-config';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true, // Important for standalone components
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, RouterOutlet] // Import CommonModule to enable *ngIf and other directives
})

export class AppComponent {
  auth;
  db; // Firestore instance
  registrationMessage: string | null = null; // Success/error message for registration
  loginErrorMessage: string | null = null; // Holds the error message
  loginSuccessMessage: string | null = null; // Holds the success message
  isRegistering: boolean = false;

  constructor(private router: Router) {
    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
    this.db = getFirestore(app); // Initialize Firestore
  }

  // Method to log in with email and password
  login(email: string, password: string): Promise<void> {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then(() => {
        this.loginErrorMessage = null; // Clear any previous error message
        this.loginSuccessMessage = 'Correct login information!'; // Set success message
        this.router.navigate(['/home']);
      })
      .catch(error => {
        this.loginErrorMessage = 'Incorrect email or password';
        this.loginSuccessMessage = null; // Clear the success message on failure
        console.error('Error logging in:', error);
      });
  }

  // Method to log in with Google
  loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider)
      .then(async (result) => {
        const user = result.user;
        console.log('User signed in with Google:', user);

        // Save user data to Firestore if it's their first time logging in
        const userDocRef = doc(this.db, 'users', user.uid);
        const userData = {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString()
        };

        await setDoc(userDocRef, userData, { merge: true }); // Merge data if document exists
        this.router.navigate(['/home']); // Navigate to home page
      })
      .catch(error => {
        console.error('Error signing in with Google:', error);
      });
  }

  // Method to log out
  logout(): Promise<void> {
    return signOut(this.auth)
      .then(() => {
        console.log('User logged out');
        this.router.navigate(['/']);
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

  // Method called on form submission for registration
  onRegister(event: Event): void {
    event.preventDefault();
    const target = event.target as HTMLFormElement;
    const emailInput = target.querySelector<HTMLInputElement>('#register-email')!;
    const passwordInput = target.querySelector<HTMLInputElement>('#register-password')!;

    const email = emailInput.value;
    const password = passwordInput.value;

    this.register(email, password);
  }

  // Method to register a new user
  register(email: string, password: string): Promise<void> {
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then(userCredential => {
        const user = userCredential.user;
        console.log('User registered:', user);

        // Save user data to Firestore
        return setDoc(doc(this.db, 'users', user.uid), {
          email: user.email,
          createdAt: new Date().toISOString()
        });
      })
      .then(() => {
        this.registrationMessage = 'Account successfully created and stored in the database!';
        console.log('User data successfully saved to Firestore.');
      })
      .catch(error => {
        this.registrationMessage = `Error: ${error.message}`;
        console.error('Error registering user or saving data:', error);
      });
  }

  ngOnInit(): void {
    this.authStateObserver();
  }

  toggleForm(): void {
    this.isRegistering = !this.isRegistering;
  }
}

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
import { FormsModule } from '@angular/forms';
import { SearchComponent } from './search/search.component';

@Component({
  selector: 'app-root',
  standalone: true, // Important for standalone components
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, RouterOutlet, FormsModule] // Import CommonModule to enable *ngIf and other directives
})
export class AppComponent {
  auth;
  db; // Firestore instance
  registrationMessage: string | null = null; // Success/error message for registration
  loginErrorMessage: string | null = null; // Holds the error message
  loginSuccessMessage: string | null = null; // Holds the success message
  isRegistering: boolean = false;
  selectedProfileType: string = 'Customer'; // Profile type selected during registration

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

  onRegister(event: Event): void {
    event.preventDefault();
    const target = event.target as HTMLFormElement;
    const emailInput = target.querySelector<HTMLInputElement>('#register-email')!;
    const passwordInput = target.querySelector<HTMLInputElement>('#register-password')!;
    const usernameInput = target.querySelector<HTMLInputElement>('#register-username')!;
    const addressInput = target.querySelector<HTMLInputElement>('#register-address')!; // Address field for Restaurant

    const email = emailInput.value;
    const password = passwordInput.value;
    const username = usernameInput.value;
    const address = this.selectedProfileType === 'Restaurant' ? addressInput.value : null;

    console.log('Registering with:', { email, username, password, address });

    this.register(email, password, username, address);
  }

  register(email: string, password: string, username: string, address: string | null): Promise<void> {
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then(userCredential => {
        const user = userCredential.user;
        console.log('User registered:', user);

        const defaultProfilePicture = 'https://example.com/default-profile-picture.png';

        const userData: any = {
          email: user.email,
          username: username,
          profileType: this.selectedProfileType,
          profilePicture: defaultProfilePicture,
          createdAt: new Date().toISOString()
        };

        if (address) {
          userData.address = address; // Add address if profile type is Restaurant
        }

        // Save user data to Firestore
        return setDoc(doc(this.db, 'users', user.uid), userData).then(() => {
          // Sign out the user after registration to avoid them being considered authenticated
          return this.auth.signOut();
        });
      })
      .then(() => {
        this.registrationMessage = 'Account successfully created! Please log in.';
        console.log('User data saved to Firestore and user signed out.');

        // Redirect to login page
        this.router.navigate(['/login']); // Adjust route as needed
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

  // Method to handle profile type selection
  toggleProfileType(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (target.classList.contains('profile-type-half')) {
      this.selectedProfileType = target.classList.contains('customer') ? 'Customer' : 'Restaurant';
    }
  }
}

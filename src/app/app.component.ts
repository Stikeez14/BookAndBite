import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule for NgIf directive
import { environment } from '../environments/firebase-config';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule] // Include CommonModule in the component imports
})
export class AppComponent {
  errorMessage: string = '';

  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  async login(email: string, password: string) {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(email, password);
      this.router.navigate(['/']);  // Navigate to the desired route after successful login
    } catch (error) {
      this.handleError(error);  // Pass the error to the error handling function
    }
  }

  private handleError(error: unknown) {
    if (error instanceof Error) {
      this.errorMessage = error.message;
    } else {
      this.errorMessage = 'An unknown error occurred. Please try again later.';
    }
    console.error('Login error: ', error);
  }
}

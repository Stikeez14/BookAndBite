import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes'; // Import routes
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { firebaseConfig } from '../environments/firebase-config';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),  // Provide the routes configuration
    provideFirebaseApp(() => initializeApp(firebaseConfig)),  // Initialize Firebase
    provideAuth(() => getAuth())  // Initialize Firebase Auth
  ]
};


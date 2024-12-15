import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "bookandbite-d1f76", appId: "1:70734865904:web:5297996474b23fb2cda935", storageBucket: "bookandbite-d1f76.firebasestorage.app", apiKey: "AIzaSyDVAylVgzOwBkVgVC-nzF45XYiEjV4NHik", authDomain: "bookandbite-d1f76.firebaseapp.com", messagingSenderId: "70734865904" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())]
};

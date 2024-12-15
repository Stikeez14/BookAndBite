import { Component } from '@angular/core';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore, collection, addDoc } from '@angular/fire/firestore';
import { firebaseConfig } from '../../environments/firebase-config';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  providers: [
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
})

export class LoginComponent {
  constructor(private auth: Auth, private firestore: Firestore) {}

  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('User logged in:', userCredential.user);
    } catch (error) {
      console.error('Error logging in:', error);
    }
  }

  async saveData() {
    try {
      const docRef = await addDoc(collection(this.firestore, 'users'), {
        name: 'John Doe',
        email: 'john.doe@example.com'
      });
      console.log('Document written with ID: ', docRef.id);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  }
}

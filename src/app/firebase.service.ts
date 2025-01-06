import {Injectable} from '@angular/core';
import {collection, Firestore, getDocs, query, where} from '@angular/fire/firestore';
import {firebaseConfig} from '../environments/firebase-config';
import {initializeApp} from 'firebase/app';
import {Restaurant} from './restaurant.model';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule


@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private firestore: Firestore;

  constructor() {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    // @ts-ignore
    this.firestore = new Firestore(app);
  }

  // Function to get all restaurants from Firestore
  async getRestaurants(): Promise<Restaurant[]> {
    try {
      const usersCollection = collection(this.firestore, 'users');
      const q = query(usersCollection, where('ProfileType', '==', 'Restaurant')
      );  // Fetch users where isRestaurant is true

      const snapshot = await getDocs(q);

      // Map the data to Restaurant model
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Restaurant[];
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      return [];
    }
  }
}

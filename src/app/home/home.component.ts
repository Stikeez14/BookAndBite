import { Component, OnInit } from '@angular/core';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  username: string | null = null;
  profilePicture: string | null = null; // To store the profile picture URL

  constructor() {}

  async ngOnInit(): Promise<void> {
    const auth = getAuth();
    const db = getFirestore();

    onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        // User is signed in, fetch their data from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          this.username = userData['username'] || null; // Use the stored username
          this.profilePicture = userData['profilePicture'] || null; // Use the stored profile picture
        } else {
          console.error('User document does not exist in Firestore.');
          this.username = null;
          this.profilePicture = null; // Clear profile picture if document doesn't exist
        }
      } else {
        // User is not signed in
        this.username = null;
        this.profilePicture = null; // Clear profile picture
      }
    });
  }
}

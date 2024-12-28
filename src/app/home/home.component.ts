import { Component, OnInit } from '@angular/core';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc,setDoc } from 'firebase/firestore';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  username: string | null = null;
  profilePicture: string | null = null; // To store the profile picture URL
  selectedFile: File | null = null; // Store selected file

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
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    }
  }
  async saveProfilePicture(): Promise<void> {
    if (!this.selectedFile) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string; // Base64 string of the image
      const auth = getAuth();
      const user = auth.currentUser;
      const db = getFirestore();

      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);

          // Update the user's document with the Base64 string
          await setDoc(
            userDocRef,
            { profilePicture: base64String },
            { merge: true }
          );

          console.log('Profile picture saved successfully!');
          this.profilePicture = base64String; // Update UI
          this.selectedFile = null; // Clear the selected file
        } catch (error) {
          console.error('Error saving profile picture:', error);
        }
      }
    };

    reader.readAsDataURL(this.selectedFile); // Read the file as a Base64 string
  }
}

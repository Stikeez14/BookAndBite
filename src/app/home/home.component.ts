import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  username: string | null = null;
  profilePicture: string | null = null;
  selectedFile: File | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor() {}

  ngOnInit(): void {
    const auth = getAuth();
    const db = getFirestore();

    onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        // Fetch user data
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          this.username = userData['username'] || null;
          this.profilePicture = userData['profilePicture'] || null;
        } else {
          console.error('User document does not exist in Firestore.');
        }
      } else {
        this.username = null;
        this.profilePicture = null;
      }
    });
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      // Create a temporary URL for preview
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePicture = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);

      // Optionally, save the profile picture to Firestore
      this.saveProfilePicture();
    }
  }

  async saveProfilePicture(): Promise<void> {
    if (!this.selectedFile) return;

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore();
    const userDocRef = doc(db, 'users', user.uid);

    // Save the Base64 string or a link to Firestore
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await setDoc(userDocRef, { profilePicture: reader.result }, { merge: true });
        console.log('Profile picture updated!');
      } catch (error) {
        console.error('Error updating profile picture:', error);
      }
    };
    reader.readAsDataURL(this.selectedFile);
  }
}

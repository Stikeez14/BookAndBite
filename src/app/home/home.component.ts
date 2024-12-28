import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { CommonModule } from '@angular/common'; // Add this import

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  styleUrls: ['./home.component.css'],
  imports: [CommonModule] // Add CommonModule to imports
})
export class HomeComponent implements OnInit {
  username: string | null = null;
  profilePicture: string | null = null;
  selectedFile: File | null = null;
  restaurants: any[] = [];  // Holds the list of restaurants

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor() {}

  ngOnInit(): void {
    const auth = getAuth();
    const db = getFirestore();

    // Watch for authentication state changes
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

        // Fetch restaurants from Firestore
        this.fetchRestaurants();
      } else {
        this.username = null;
        this.profilePicture = null;
      }
    });
  }

  // Fetch restaurants from Firestore
  async fetchRestaurants(): Promise<void> {
    const db = getFirestore();
    const restaurantsRef = collection(db, 'users');
    const querySnapshot = await getDocs(restaurantsRef);

    console.log("Fetched documents count:", querySnapshot.size); // Log the number of documents fetched

    this.restaurants = [];  // Clear previous data

    // Iterate through each document in Firestore
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      console.log("Document data for restaurant:", userData);  // Log the document data

      // Only add restaurants to the list where profileType is 'Restaurant'
      if (userData['profileType'] === 'Restaurant') {
        this.restaurants.push({
          name: userData['username'],
          description: userData['address'] || 'No description available.',
          profilePicture: userData['profilePicture'] || 'https://via.placeholder.com/150'
        });
      }
    });

    console.log("Filtered restaurant data:", this.restaurants);  // Log the filtered restaurants list
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

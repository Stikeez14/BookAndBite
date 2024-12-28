import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { CommonModule } from '@angular/common'; // Add this import

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  styleUrls: ['./home.component.css'],
  imports: [CommonModule] // Add CommonModule to imports
})
export class HomeComponent implements OnInit, OnDestroy {
  username: string | null = null;
  profilePicture: string | null = null;
  selectedFile: File | null = null;
  restaurants: any[] = [];  // Holds the list of restaurants
  unsubscribe: () => void = () => {};  // Holds the unsubscribe function

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

        // Fetch restaurants in real-time
        this.fetchRestaurantsRealTime();
      } else {
        this.username = null;
        this.profilePicture = null;
      }
    });
  }

  // Fetch restaurants from Firestore in real-time
  fetchRestaurantsRealTime(): void {
    const db = getFirestore();
    const restaurantsRef = collection(db, 'users');

    // Listen to real-time updates from Firestore
    this.unsubscribe = onSnapshot(restaurantsRef, (querySnapshot) => {
      console.log("Fetched documents count:", querySnapshot.size); // Log the number of documents fetched

      this.restaurants = [];  // Clear previous data

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
    });
  }

  // Trigger the file input for uploading a new profile picture
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  // Handle file selection for profile picture
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

  // Save the selected profile picture to Firestore
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

  // Unsubscribe from real-time updates when the component is destroyed
  ngOnDestroy(): void {
    this.unsubscribe();  // Unsubscribe from real-time updates
  }
}

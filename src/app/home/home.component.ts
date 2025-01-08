import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {getAuth, onAuthStateChanged, User} from 'firebase/auth';
import {collection, doc, getDoc, getFirestore, onSnapshot, setDoc} from 'firebase/firestore';
import {CommonModule} from '@angular/common';
import {FirebaseService} from '../firebase.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, FormsModule]
})
export class HomeComponent implements OnInit, OnDestroy {
  username: string | null = null;
  profilePicture: string | null = null;
  selectedFile: File | null = null;
  restaurants: any[] = [];
  filteredRestaurants: any[] = [];
  searchQuery: string = '';
  unsubscribe: () => void = () => {};
  currentIndex: number = 0;
  intervalId: any;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    const auth = getAuth();
    const db = getFirestore();

    onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          this.username = userData['username'] || null;
          this.profilePicture = userData['profilePicture'] || null;
        } else {
          console.error('User document does not exist in Firestore.');
        }

        this.fetchRestaurantsRealTime();
      } else {
        this.username = null;
        this.profilePicture = null;
      }
    });

    this.startRestaurantRotation();
  }

  fetchRestaurantsRealTime(): void {
    const db = getFirestore();
    const restaurantsRef = collection(db, 'users');

    this.unsubscribe = onSnapshot(restaurantsRef, (querySnapshot) => {
      this.restaurants = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data();

        if (userData['profileType'] === 'Restaurant') {
          this.restaurants.push({
            id: doc.id,
            name: userData['username'],
            description: userData['address'] || 'No description available.',
            profilePicture: userData['profilePicture'] || 'https://via.placeholder.com/150'
          });
        }
      });

      this.updateDisplayedRestaurants();
    });
  }

  updateDisplayedRestaurants(): void {
    this.filteredRestaurants = this.restaurants.slice(this.currentIndex, this.currentIndex + 3);
  }

  rotationInProgress: boolean = false;

  startRestaurantRotation(): void {
    this.intervalId = setInterval(() => {
      if (this.searchQuery.trim() === '' && this.restaurants.length > 3 && !this.rotationInProgress) {
        this.rotationInProgress = true;

        // Add 'exiting' class to current items
        this.filteredRestaurants.forEach((_, index) => {
          const item = document.querySelector(`.restaurant-item:nth-child(${index + 1})`);
          item?.classList.add('exiting');
        });

        // Wait for the transition to complete before updating the items
        setTimeout(() => {
          this.currentIndex = (this.currentIndex + 1) % (this.restaurants.length - 2);
          this.updateDisplayedRestaurants();

          // Remove 'exiting' class and add 'active' class to new items
          this.filteredRestaurants.forEach((_, index) => {
            const item = document.querySelector(`.restaurant-item:nth-child(${index + 1})`);
            item?.classList.remove('exiting');
            item?.classList.add('active');
          });

          this.rotationInProgress = false;
        }, 600); // Match this to the CSS transition duration
      }
    }, 5000);
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      // Stop the rotation while searching
      clearInterval(this.intervalId);

      // Filter restaurants by name only, not address
      this.filteredRestaurants = this.restaurants.filter(restaurant => {
        const query = this.searchQuery.toLowerCase();
        // Only match by name, ignore address or description
        return restaurant.name.toLowerCase().includes(query);
      });

      // Log no results if there are no matches (for debugging purposes)
      if (this.filteredRestaurants.length === 0) {
        console.log("No restaurants match the search criteria.");
      }
    } else {
      // Resume rotation when search query is cleared
      this.updateDisplayedRestaurants();
      this.startRestaurantRotation();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe();
    clearInterval(this.intervalId);
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.profilePicture = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);

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

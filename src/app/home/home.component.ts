import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { CommonModule } from '@angular/common'; // Add this import
import { FirebaseService } from '../firebase.service'; // Import FirebaseService
import { SearchComponent } from '../search/search.component';
import {FormsModule} from '@angular/forms'; // Import SearchComponent
import { ReserveTableComponent } from '../reserve-table/reserve-table.component';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  styleUrls: ['./home.component.css'],

  imports: [CommonModule, FormsModule] // Add SearchComponent to imports

})
export class HomeComponent implements OnInit, OnDestroy {
  username: string | null = null;
  profilePicture: string | null = null;
  selectedFile: File | null = null;
  profileType: string | null = null;
  displayName: string | null = null;
  photoURL: string | null = null;

  restaurants: any[] = [];
  restaurantBookings: any[] = []; // GRIJA
  filteredRestaurants: any[] = [];
  searchQuery: string = '';
  unsubscribe: () => void = () => {};
  currentIndex: number = 0;
  intervalId: any;


  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private firebaseService: FirebaseService,private router: Router) {
  }

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
          this.profileType = userData['profileType'] || null;  // Store profileType
          this.displayName = userData['displayName'] || null;
          this.photoURL = userData['photoURL'] || null;
        } else {
          console.error('User document does not exist in Firestore.');
        }

        // Customer-specific logic
        if (this.profileType === 'Customer') {
          this.fetchRestaurantsRealTime();
          this.startRestaurantRotation();
        }

        // Restaurant-specific logic
        if (this.profileType === 'Restaurant') {
          this.fetchBookingsRealTime();
        }
      } else {
        this.username = null;
        this.profilePicture = null;
      }
    });
  }

  // AICI TREBE SA MODIFICAM CA NU E IMPLEMENTATA
  fetchBookingsRealTime(): void {
    const db = getFirestore();
    const bookingsRef = collection(db, 'bookings');

    this.unsubscribe = onSnapshot(bookingsRef, (querySnapshot) => {
      this.restaurantBookings = [];

      querySnapshot.forEach((doc) => {
        const bookingData = doc.data();
        if (bookingData['restaurantId'] === getAuth().currentUser?.uid) {
          this.restaurantBookings.push({
            id: doc.id,
            ...bookingData,
          });
        }
      });

      console.log('Bookings:', this.restaurantBookings);
    });
  }


  fetchRestaurantsRealTime(): void {
    const db = getFirestore();
    const restaurantsRef = collection(db, 'users');

    this.unsubscribe = onSnapshot(restaurantsRef, (querySnapshot) => {
      this.restaurants = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data();

        // Only include users with profileType 'Restaurant'
        if (userData['profileType'] === 'Restaurant') {
          this.restaurants.push({
            id: doc.id,
            name: userData['username'],
            description: userData['address'] || 'No description available.',
            profilePicture: userData['profilePicture'] || 'https://via.placeholder.com/150',
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
  navigateToRestaurant(restaurantId: string): void {
    this.router.navigate(['/restaurant', restaurantId]);

  }

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
        await setDoc(userDocRef, {profilePicture: reader.result}, {merge: true});
        console.log('Profile picture updated!');
      } catch (error) {
        console.error('Error updating profile picture:', error);
      }
    };
    reader.readAsDataURL(this.selectedFile);
  }



}

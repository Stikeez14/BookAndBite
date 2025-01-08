import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { CommonModule } from '@angular/common'; // Add this import
import { FirebaseService } from '../firebase.service'; // Import FirebaseService
import { SearchComponent } from '../search/search.component';
import {FormsModule} from '@angular/forms'; // Import SearchComponent
import { ReserveTableComponent } from '../reserve-table/reserve-table.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  styleUrls: ['./home.component.css'],

  imports: [CommonModule, SearchComponent, FormsModule,ReserveTableComponent] // Add SearchComponent to imports

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

  constructor(private firebaseService: FirebaseService) {
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
        await setDoc(userDocRef, {profilePicture: reader.result}, {merge: true});
        console.log('Profile picture updated!');
      } catch (error) {
        console.error('Error updating profile picture:', error);
      }
    };
    reader.readAsDataURL(this.selectedFile);
  }


  reservationQuery: string = ''; // Query for searching restaurants in reservation section
  filteredReservationRestaurants: any[] = []; // Filtered list for reservation search
  selectedRestaurantForReservation: any = null; // Selected restaurant for reservation
  selectedReservationDate: string = ''; // Date selected for reservation
  reservationAvailability: boolean | null = null; // Whether the selected date is available

  // Existing methods...

  // Filter restaurants for the reservation search
  filterReservationRestaurants(): void {
    if (this.reservationQuery.trim()) {
      this.filteredReservationRestaurants = this.restaurants.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(this.reservationQuery.toLowerCase())
      );
    } else {
      this.filteredReservationRestaurants = [];
    }
  }
  selectRestaurantForReservation(restaurant: any): void {
    this.selectedRestaurantForReservation = restaurant;

    // Reset other reservation properties
    this.selectedReservationDate = '';
    this.reservationAvailability = null;

    // Mock availability data (replace with Firestore data as needed)
    this.selectedRestaurantForReservation.availability = {
      '2025-01-10': true,
      '2025-01-11': false,
      '2025-01-12': true,
    };
  }
  timeIntervals: { start: string; end: string; available: boolean }[] = [];
  selectedTimeInterval: any = null;

  // Existing methods...

  // Generate time intervals for the selected date
  generateTimeIntervals(): void {
    if (!this.selectedReservationDate) return;

    // Default intervals for the day (all available by default)
    const intervals = [
      { start: '00:00', end: '01:00', available: true },
      { start: '01:00', end: '02:00', available: true },
      { start: '02:00', end: '03:00', available: true },
      { start: '03:00', end: '04:00', available: true },
      { start: '04:00', end: '05:00', available: true },
      { start: '05:00', end: '06:00', available: true },
      { start: '06:00', end: '07:00', available: true },
      { start: '07:00', end: '08:00', available: true },
      { start: '08:00', end: '09:00', available: true },
      { start: '09:00', end: '10:00', available: true },
      { start: '10:00', end: '11:00', available: true },
      { start: '11:00', end: '12:00', available: true },
      { start: '12:00', end: '13:00', available: true },
      { start: '13:00', end: '14:00', available: true },
      { start: '14:00', end: '15:00', available: true },
      { start: '15:00', end: '16:00', available: true },
      { start: '16:00', end: '17:00', available: true },
      { start: '17:00', end: '18:00', available: true },
      { start: '18:00', end: '19:00', available: true },
      { start: '19:00', end: '20:00', available: true },
      { start: '20:00', end: '21:00', available: true },
      { start: '21:00', end: '22:00', available: true },
      { start: '22:00', end: '23:00', available: true },
      { start: '23:00', end: '00:00', available: true }, // This represents midnight for the next day
    ];


    // Check if the selected date has existing reservations
    if (this.selectedRestaurantForReservation && this.selectedRestaurantForReservation.reservations) {
      const dateReservations = this.selectedRestaurantForReservation.reservations[this.selectedReservationDate] || [];

      // Mark intervals as unavailable if already reserved
      intervals.forEach((interval) => {
        if (dateReservations.includes(`${interval.start}-${interval.end}`)) {
          interval.available = false;
        }
      });
    }

    this.timeIntervals = intervals;
    this.selectedTimeInterval = null; // Reset the selected interval
  }

  // Select a time interval
  selectTimeInterval(interval: any): void {
    if (interval.available) {
      this.selectedTimeInterval = interval;
    }
  }

  // Reserve a table
  reserveTable(): void {
    if (!this.selectedRestaurantForReservation || !this.selectedReservationDate || !this.selectedTimeInterval) {
      console.error('Reservation failed: Missing data.');
      return;
    }

    const intervalString = `${this.selectedTimeInterval.start}-${this.selectedTimeInterval.end}`;

    // Add the reservation to the restaurant's data (mock update; replace with Firestore logic)
    if (!this.selectedRestaurantForReservation.reservations) {
      this.selectedRestaurantForReservation.reservations = {};
    }

    if (!this.selectedRestaurantForReservation.reservations[this.selectedReservationDate]) {
      this.selectedRestaurantForReservation.reservations[this.selectedReservationDate] = [];
    }

    this.selectedRestaurantForReservation.reservations[this.selectedReservationDate].push(intervalString);
    console.log(`Table reserved at ${this.selectedRestaurantForReservation.name} on ${this.selectedReservationDate} for ${intervalString}.`);

    // Refresh intervals to reflect the new reservation
    this.generateTimeIntervals();
  }
}

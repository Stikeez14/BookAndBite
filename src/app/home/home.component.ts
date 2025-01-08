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
  restaurants: any[] = [];  // Holds the list of restaurants
  filteredRestaurants: any[] = []; // Holds the filtered list based on search
  searchQuery: string = ''; // Holds the search query
  unsubscribe: () => void = () => {
  };  // Holds the unsubscribe function

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private firebaseService: FirebaseService) {
  }

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
            id: doc.id,
            name: userData['username'],
            description: userData['address'] || 'No description available.',
            profilePicture: userData['profilePicture'] || 'https://via.placeholder.com/150'
          });
        }
      });

      console.log("Filtered restaurant data:", this.restaurants);  // Log the filtered restaurants list
      this.filteredRestaurants = [...this.restaurants];  // Initialize filtered restaurants
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
        await setDoc(userDocRef, {profilePicture: reader.result}, {merge: true});
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

  // Search functionality to filter restaurants based on user input
  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.filteredRestaurants = this.restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredRestaurants = [...this.restaurants]; // If no search query, show all restaurants
    }
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

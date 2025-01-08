import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import {FirebaseService} from '../firebase.service';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-restaurant-page',
  templateUrl: './restaurant-page.component.html',
  styleUrls: ['./restaurant-page.component.css'],
  imports: [
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class RestaurantPageComponent implements OnInit {
  restaurant: any = null; // Holds the restaurant data

  constructor(private route: ActivatedRoute,private firebaseService: FirebaseService,private router: Router) {}

  async ngOnInit(): Promise<void> {
    const restaurantId = this.route.snapshot.paramMap.get('id'); // Get the ID from the URL
    if (restaurantId) {
      await this.fetchRestaurantData(restaurantId);
    }
  }

  // Fetch restaurant data from Firestore
  async fetchRestaurantData(restaurantId: string): Promise<void> {
    const db = getFirestore();
    const restaurantRef = doc(db, 'users', restaurantId); // Adjust collection name as needed
    const restaurantDoc = await getDoc(restaurantRef);

    if (restaurantDoc.exists()) {
      this.restaurant = restaurantDoc.data();
    } else {
      console.error('Restaurant not found!');
    }
  }
  reservationQuery: string = ''; // Query for searching restaurants in reservation section
  filteredReservationRestaurants: any[] = []; // Filtered list for reservation search
  selectedRestaurantForReservation: any = null; // Selected restaurant for reservation
  selectedReservationDate: string = ''; // Date selected for reservation
  reservationAvailability: boolean | null = null; // Whether the selected date is available

  // Existing methods...

  // Filter restaurants for the reservation search


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


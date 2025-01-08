import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-restaurant-page',
  template: `
    <div *ngIf="restaurant">
      <h2>{{ restaurant.name }}</h2>
      <img [src]="restaurant.profilePicture" alt="Restaurant">
      <p>{{ restaurant.description }}</p>
    </div>
    <div *ngIf="!restaurant">Loading...</div>
  `,
  styleUrls: ['./restaurant-page.component.css'], // Update if you have specific styles
})
export class RestaurantPageComponent implements OnInit {
  restaurant: any; // Holds restaurant data

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      console.error('No ID found in route!');
      return;
    }

    console.log('Restaurant ID:', id); // Ensure the ID is correctly fetched

    // Simulated restaurant data
    this.restaurant = {
      name: 'Demo Restaurant',
      profilePicture: 'https://via.placeholder.com/150',
      description: 'A great place to eat!'
    };

    // Replace with Firestore logic if needed
  }


  // If fetching from Firestore, replace the above with data retrieval logic
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

@Component({
  selector: 'app-restaurant-page',
  templateUrl: './restaurant-page.component.html',
  styleUrls: ['./restaurant-page.component.css'],
})
export class RestaurantPageComponent implements OnInit {
  restaurant: any = null; // Holds the restaurant data

  constructor(private route: ActivatedRoute) {}

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
}


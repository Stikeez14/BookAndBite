import { Component, Output, EventEmitter } from '@angular/core';
import { FirebaseService } from '../firebase.service';
import { Restaurant } from '../restaurant.model';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  imports: [
    FormsModule
  ],
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  searchQuery: string = '';

  @Output() searchResults = new EventEmitter<any[]>(); // Emits the filtered restaurants

  constructor(private firebaseService: FirebaseService) {}

  async performSearch() {
    if (!this.searchQuery.trim()) {
      alert('Please enter a search query!');
      return;
    }

    try {
      const snapshot = await this.firebaseService.getRestaurants();
      const allRestaurants = snapshot.map(doc => ({
        id: doc.id,
        name: doc.name,
        location: doc.location,
        cuisine: doc.cuisine,
      }));

      // Filter restaurants based on the search query
      const filteredResults = allRestaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        restaurant.location.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(this.searchQuery.toLowerCase())
      );

      this.searchResults.emit(filteredResults); // Emit filtered results to parent component
    } catch (error) {
      console.error('Error performing search:', error);
    }
  }
}

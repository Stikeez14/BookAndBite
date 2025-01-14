import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';  // ✅ Import CommonModule

@Component({
  selector: 'app-reserve-table',
  templateUrl: './reserve-table.component.html',
  styleUrls: ['./reserve-table.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule  // ✅ Add CommonModule here
  ]
})
export class ReserveTableComponent implements OnInit {
  @Input() restaurantDetails: any; // Details of the restaurant to be passed in
  @Input() availability: { [key: string]: boolean } = {}; // Availability for specific dates

  selectedDate: string = ''; // User's selected date
  isAvailable: boolean | null = null; // Whether the selected date is available

  constructor() {}

  ngOnInit(): void {}

  // Check availability for the selected date
  checkAvailability(): void {
    this.isAvailable = this.availability[this.selectedDate] || false;
  }

  // Reserve the table if available
  reserveTable(): void {
    if (this.isAvailable) {
      console.log(`Table reserved for ${this.selectedDate} at ${this.restaurantDetails.name}`);
      // Implement reservation logic here (e.g., Firestore write operation)
    } else {
      console.log('Selected date is not available for reservation.');
    }
  }
}

import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component'; // Login page
import { HomeComponent } from './home/home.component'; // Home page
import { RestaurantPageComponent } from './restaurant-page/restaurant-page.component'; // Restaurant details page

export const routes: Routes = [
  { path: 'app', component: AppComponent },  // Login route
  { path: 'home', component: HomeComponent }, // Home route
  { path: 'restaurant/:id', component: RestaurantPageComponent }, // Restaurant page route
  { path: ' ', redirectTo: 'home' } // Wildcard route as the last entry
];


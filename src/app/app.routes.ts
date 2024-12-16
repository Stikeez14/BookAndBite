import { Routes } from '@angular/router';
import { AppComponent } from './app.component'; // The login page
import { HomeComponent } from './home/home.component'; // The home page

export const routes: Routes = [
  { path: '', component: AppComponent },  // Login route
  { path: 'home', component: HomeComponent },
  { path: '**', redirectTo: '' }// Home page route after login
];


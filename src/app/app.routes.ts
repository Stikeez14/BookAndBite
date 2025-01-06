import { Routes } from '@angular/router';
import { AppComponent } from './app.component'; // The login page
import { HomeComponent } from './home/home.component'; // The home page
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule

export const routes: Routes = [
  { path: 'app', component: AppComponent },  // Login route
  { path: 'home', component: HomeComponent },
  { path: '**', redirectTo: '' }// Home page route after login
];


import { Component, OnInit } from '@angular/core';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userEmail: string | null = null;
  username: string | null = null;

  constructor() {}

  ngOnInit(): void {
    const auth = getAuth();
    onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        // User is signed in
        this.userEmail = user.email;
        // @ts-ignore
        this.username = this.extractEmailUsername(user.email);
      } else {
        // User is not signed in
        this.userEmail = null;
      }
    });
  }
  extractEmailUsername(email: string): string {

    const username = email.split('@')[0]; // Extract the username part
    const firstCharUppercase = username.charAt(0).toUpperCase(); // Convert the first character to uppercase
    const remainingChars = username.slice(1); // Extract the rest of the username
    return firstCharUppercase + remainingChars;  }
}


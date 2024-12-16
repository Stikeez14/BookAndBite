import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { getAuth } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      // If user is authenticated, allow navigation
      return true;
    } else {
      // If not authenticated, redirect to login page
      this.router.navigate(['/']);
      return false;
    }
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Trip } from '../models/trip';
import { TripData } from '../services/trip-data';
import { AuthenticationService } from '../services/authentication';

@Component({
  selector: 'app-trip-card',
  imports: [CommonModule],
  templateUrl: './trip-card.html',
  styleUrl: './trip-card.css',
  providers: [TripData]
})
export class TripCard {

  @Input('trip') trip!: Trip;

  public isAdmin$: Observable<boolean>;

  constructor(
    private router: Router,
    private tripDataService: TripData,
    private authenticationService: AuthenticationService
  ) {
    this.isAdmin$ = this.authenticationService.adminState$;
  }

  // Open the reviews page for this trip.
  public viewReviews(trip: Trip): void {
    this.router.navigate([
      'trip-reviews',
      trip.code
    ]);
  }

  // Open the administrator edit page.
  public editTrip(trip: Trip): void {
    localStorage.removeItem('tripCode');
    localStorage.setItem('tripCode', trip.code);

    this.router.navigate(['edit-trip']);
  }

  // Delete a trip.
  public deleteTrip(trip: Trip): void {
    if (confirm(`Delete ${trip.name}?`)) {
      this.tripDataService.deleteTrip(trip.code)
        .subscribe({
          next: () => {
            window.location.reload();
          },
          error: (error: any) => {
            console.error(
              'Unable to delete trip:',
              error
            );
          }
        });
    }
  }
}

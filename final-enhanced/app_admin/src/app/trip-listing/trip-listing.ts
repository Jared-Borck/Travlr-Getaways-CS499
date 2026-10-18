import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { TripCard } from '../trip-card/trip-card';
import { Trip } from '../models/trip';
import { TripData } from '../services/trip-data';
import { AuthenticationService } from '../services/authentication';

@Component({
  selector: 'app-trip-listing',
  imports: [CommonModule, TripCard],
  templateUrl: './trip-listing.html',
  styleUrl: './trip-listing.css',
  providers: [TripData]
})
export class TripListing implements OnInit {

  trips: Array<Trip> = [];
  message: string = '';

  public isAdmin$: Observable<boolean>;

  constructor(
    private tripDataService: TripData,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    this.isAdmin$ = this.authenticationService.adminState$;
  }

  public addTrip(): void {
    this.router.navigate(['add-trip']);
  }

  private getStuff(): void {
    this.tripDataService.getTrips()
      .subscribe({
        next: (value: Trip[]) => {
          this.trips = value;

          if (value.length > 0) {
            this.message = 'There are ' + value.length + ' trips available.';
          } else {
            this.message = 'There were no trips retrieved from the database';
          }

          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Unable to retrieve trips:', error);
        }
      });
  }

  ngOnInit(): void {
    this.getStuff();
  }
}

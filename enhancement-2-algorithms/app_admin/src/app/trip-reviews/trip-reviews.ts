import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

import { Review } from '../models/review';
import { Trip } from '../models/trip';
import { TripData } from '../services/trip-data';
import { AuthenticationService } from '../services/authentication';

@Component({
  selector: 'app-trip-reviews',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './trip-reviews.html',
  styleUrl: './trip-reviews.css'
})
export class TripReviews implements OnInit {

  tripCode: string = '';
  trip: Trip | null = null;

  reviews: Review[] = [];

  formReview: Review = new Review();

  editingReviewId: string = '';

  message: string = '';
  errorMessage: string = '';

  public isLoggedIn$: Observable<boolean>;

  constructor(
    private route: ActivatedRoute,
    private tripDataService: TripData,
    private authenticationService: AuthenticationService,
    private cdr: ChangeDetectorRef
  ) {
    this.isLoggedIn$ = this.authenticationService.authState$;
  }

  ngOnInit(): void {
    this.tripCode =
      this.route.snapshot.paramMap.get('tripCode') || '';

    this.formReview.tripCode = this.tripCode;

    this.loadTrip();
    this.loadReviews();
  }

  // Load the selected trip.
  private loadTrip(): void {
    if (!this.tripCode) {
      return;
    }

    this.tripDataService.getTrip(this.tripCode)
      .subscribe({
        next: (trip: Trip) => {
          this.trip = trip;
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Unable to retrieve trip:', error);

          this.errorMessage =
            'Unable to retrieve trip information.';

          this.cdr.detectChanges();
        }
      });
  }

  // Load all reviews for the selected trip.
  public loadReviews(): void {
    if (!this.tripCode) {
      return;
    }

    this.tripDataService.getReviews(this.tripCode)
      .subscribe({
        next: (reviews: Review[]) => {
          this.reviews = reviews;

          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Unable to retrieve reviews:', error);

          this.errorMessage =
            'Unable to retrieve reviews.';

          this.cdr.detectChanges();
        }
      });
  }

  // Check whether the current user owns a review.
  public isOwnReview(review: Review): boolean {
    const currentUserId =
      this.authenticationService.getCurrentUserId();

    if (!currentUserId) {
      return false;
    }

    return review.userId === currentUserId;
  }

  // Check whether the current user already reviewed this trip.
  public hasCurrentUserReview(): boolean {
    const currentUserId =
      this.authenticationService.getCurrentUserId();

    if (!currentUserId) {
      return false;
    }

    return this.reviews.some(
      review => review.userId === currentUserId
    );
  }

  // Submit a new review or update an existing review.
  public submitReview(): void {
    this.message = '';
    this.errorMessage = '';

    if (this.editingReviewId) {
      this.updateReview();
    } else {
      this.addReview();
    }
  }

  // Add a new review.
  private addReview(): void {
    this.formReview.tripCode = this.tripCode;

    this.tripDataService
      .addReview(this.tripCode, this.formReview)
      .subscribe({
        next: () => {
          this.message =
            'Your review was submitted successfully.';

          this.resetForm();
          this.loadReviews();
        },
        error: (error: any) => {
          console.error('Unable to add review:', error);

          this.errorMessage =
            error?.error?.message ||
            'Unable to submit review.';

          this.cdr.detectChanges();
        }
      });
  }

  // Begin editing an existing review.
  public editReview(review: Review): void {
    this.message = '';
    this.errorMessage = '';

    this.editingReviewId = review._id;

    this.formReview = Object.assign(
      new Review(),
      review
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Save changes to an existing review.
  private updateReview(): void {
    this.tripDataService
      .updateReview(this.formReview)
      .subscribe({
        next: () => {
          this.message =
            'Your review was updated successfully.';

          this.resetForm();
          this.loadReviews();
        },
        error: (error: any) => {
          console.error('Unable to update review:', error);

          this.errorMessage =
            error?.error?.message ||
            'Unable to update review.';

          this.cdr.detectChanges();
        }
      });
  }

  // Delete one of the current user's reviews.
  public deleteReview(review: Review): void {
    const confirmed = confirm(
      'Are you sure you want to delete this review?'
    );

    if (!confirmed) {
      return;
    }

    this.message = '';
    this.errorMessage = '';

    this.tripDataService
      .deleteReview(review._id)
      .subscribe({
        next: () => {
          this.message =
            'Your review was deleted successfully.';

          if (this.editingReviewId === review._id) {
            this.resetForm();
          }

          this.loadReviews();
        },
        error: (error: any) => {
          console.error('Unable to delete review:', error);

          this.errorMessage =
            error?.error?.message ||
            'Unable to delete review.';

          this.cdr.detectChanges();
        }
      });
  }

  // Cancel editing.
  public cancelEdit(): void {
    this.message = '';
    this.errorMessage = '';

    this.resetForm();
  }

  // Reset the review form.
  private resetForm(): void {
    this.editingReviewId = '';

    this.formReview = new Review();
    this.formReview.tripCode = this.tripCode;

    this.cdr.detectChanges();
  }
}

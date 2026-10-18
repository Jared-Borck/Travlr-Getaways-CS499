import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  RankedTrip,
  RankingResponse,
  RatingWeights,
  RankingAlgorithms
} from '../models/ranking';

import { TripData } from '../services/trip-data';

@Component({
  selector: 'app-trip-rankings',

  imports: [
    CommonModule,
    RouterModule
  ],

  templateUrl: './trip-rankings.html',
  styleUrl: './trip-rankings.css'
})
export class TripRankings implements OnInit {

  // ---------------------------------------------------------
  // Ranking data returned by the backend API.
  // ---------------------------------------------------------

  public rankings: RankedTrip[] = [];
  public topTrips: RankedTrip[] = [];

  // ---------------------------------------------------------
  // General information about the available trip data.
  // ---------------------------------------------------------

  public totalTrips: number = 0;
  public totalReviewedTrips: number = 0;

  // ---------------------------------------------------------
  // Stores the weighting values used by the scoring algorithm.
  // These values explain how much each rating category
  // contributes to the final weighted score.
  // ---------------------------------------------------------

  public weights: RatingWeights | null = null;

  // ---------------------------------------------------------
  // Stores information about the algorithms used by the
  // backend, including their time and space complexity.
  // ---------------------------------------------------------

  public algorithms: RankingAlgorithms | null = null;

  // ---------------------------------------------------------
  // Page status values used to provide loading and error
  // feedback to the user.
  // ---------------------------------------------------------

  public isLoading: boolean = true;
  public errorMessage: string = '';

  constructor(
    private tripDataService: TripData,
    private cdr: ChangeDetectorRef
  ) { }

  // ---------------------------------------------------------
  // Load ranking information when the component first opens.
  // ---------------------------------------------------------

  ngOnInit(): void {
    this.loadRankings();
  }

  // ---------------------------------------------------------
  // Requests the ranking information from the backend API.
  //
  // The API response contains:
  // - weighted trip scores
  // - complete merge-sort ranking
  // - Top 3 min-heap results
  // - algorithm complexity information
  // ---------------------------------------------------------

  public loadRankings(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.tripDataService.getRankings().subscribe({
      next: (response: RankingResponse) => {

        // Save the complete ranked list.
        this.rankings = response.rankings;

        // Save the Top-K results produced by the min-heap.
        this.topTrips = response.topTrips;

        // Save general trip totals.
        this.totalTrips = response.totalTrips;
        this.totalReviewedTrips =
          response.totalReviewedTrips;

        // Save algorithm configuration and metadata.
        this.weights = response.weights;
        this.algorithms = response.algorithms;

        this.isLoading = false;

        // Refresh the interface after the asynchronous
        // API response has been processed.
        this.cdr.detectChanges();
      },

      error: (error: any) => {
        console.error(
          'Unable to retrieve trip rankings:',
          error
        );

        this.errorMessage =
          'Unable to retrieve trip rankings.';

        this.isLoading = false;

        this.cdr.detectChanges();
      }
    });
  }
}

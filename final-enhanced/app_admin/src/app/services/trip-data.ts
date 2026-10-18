import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Trip } from '../models/trip';
import { Review } from '../models/review';
import { RankingResponse } from '../models/ranking';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { BROWSER_STORAGE } from '../storage';

@Injectable({ providedIn: 'root' })
export class TripData {
  private baseUrl = 'http://localhost:3000/api';
  private tripsUrl = `${this.baseUrl}/trips`;

  constructor(
    private http: HttpClient,
    @Inject(BROWSER_STORAGE) private storage: Storage
  ) { }

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.tripsUrl);
  }

  getTrip(tripCode: string): Observable<Trip> {
    const url = `${this.tripsUrl}/${tripCode}`;
    return this.http.get<Trip>(url);
  }

  addTrip(formData: Trip): Observable<Trip> {
    return this.http.post<Trip>(
      this.tripsUrl,
      formData
    );
  }

  updateTrip(formData: Trip): Observable<Trip> {
    const url = `${this.tripsUrl}/${formData.code}`;

    return this.http.put<Trip>(
      url,
      formData
    );
  }

  deleteTrip(tripCode: string): Observable<any> {
    const url = `${this.tripsUrl}/${tripCode}`;

    return this.http.delete<any>(url);
  }

  getReviews(tripCode: string): Observable<Review[]> {
    const url =
      `${this.tripsUrl}/${tripCode}/reviews`;

    return this.http.get<Review[]>(url);
  }

  addReview(
    tripCode: string,
    review: Review
  ): Observable<Review> {
    const url =
      `${this.tripsUrl}/${tripCode}/reviews`;

    return this.http.post<Review>(
      url,
      review
    );
  }

  updateReview(review: Review): Observable<Review> {
    const url =
      `${this.baseUrl}/reviews/${review._id}`;

    return this.http.put<Review>(
      url,
      review
    );
  }

  deleteReview(reviewId: string): Observable<any> {
    const url =
      `${this.baseUrl}/reviews/${reviewId}`;

    return this.http.delete<any>(url);
  }

  getRankings(): Observable<RankingResponse> {
    const url = `${this.baseUrl}/rankings`;

    return this.http.get<RankingResponse>(url);
  }

  login(
    user: User,
    passwd: string
  ): Observable<AuthResponse> {
    return this.handleAuthAPICall(
      'login',
      user,
      passwd
    );
  }

  register(
    user: User,
    passwd: string
  ): Observable<AuthResponse> {
    return this.handleAuthAPICall(
      'register',
      user,
      passwd
    );
  }

  handleAuthAPICall(
    endpoint: string,
    user: User,
    passwd: string
  ): Observable<AuthResponse> {
    const formData = {
      name: user.name,
      email: user.email,
      password: passwd
    };

    return this.http.post<AuthResponse>(
      this.baseUrl + '/' + endpoint,
      formData
    );
  }
}

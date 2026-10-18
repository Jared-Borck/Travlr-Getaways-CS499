import { Routes } from '@angular/router';

import { TripListing } from './trip-listing/trip-listing';
import { AddTrip } from './add-trip/add-trip';
import { EditTrip } from './edit-trip/edit-trip';
import { Login } from './login/login';
import { TripReviews } from './trip-reviews/trip-reviews';
import { TripRankings } from './trip-rankings/trip-rankings';

import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: TripListing
  },

  // Trip management routes require administrator access.
  {
    path: 'add-trip',
    component: AddTrip,
    canActivate: [adminGuard]
  },
  {
    path: 'edit-trip',
    component: EditTrip,
    canActivate: [adminGuard]
  },

  // Reviews and rankings remain public because they display
  // customer-facing trip information.
  {
    path: 'trip-reviews/:tripCode',
    component: TripReviews
  },
  {
    path: 'trip-rankings',
    component: TripRankings
  },

  {
    path: 'login',
    component: Login
  }
];

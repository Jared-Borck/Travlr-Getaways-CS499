import { Routes } from '@angular/router';

import { TripListing } from './trip-listing/trip-listing';
import { AddTrip } from './add-trip/add-trip';
import { EditTrip } from './edit-trip/edit-trip';
import { Login } from './login/login';
import { TripReviews } from './trip-reviews/trip-reviews';

import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: TripListing
  },
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
  {
    path: 'trip-reviews/:tripCode',
    component: TripReviews
  },
  {
    path: 'login',
    component: Login
  }
];

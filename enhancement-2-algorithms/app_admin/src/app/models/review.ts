export class Review {
  _id: string;
  tripCode: string;
  userId: string;
  userName: string;

  valueRating: number;
  destinationRating: number;
  qualityRating: number;
  accommodationRating: number;
  activitiesRating: number;

  reviewText: string;

  createdAt: string;
  updatedAt: string;

  constructor() {
    this._id = '';
    this.tripCode = '';
    this.userId = '';
    this.userName = '';

    this.valueRating = 1;
    this.destinationRating = 1;
    this.qualityRating = 1;
    this.accommodationRating = 1;
    this.activitiesRating = 1;

    this.reviewText = '';

    this.createdAt = '';
    this.updatedAt = '';
  }
}

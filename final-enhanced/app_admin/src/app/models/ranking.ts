export class RankedTrip {
  rank: number;
  code: string;
  name: string;
  resort: string;
  image: string;
  reviewCount: number;
  weightedScore: number;

  constructor() {
    this.rank = 0;
    this.code = '';
    this.name = '';
    this.resort = '';
    this.image = '';
    this.reviewCount = 0;
    this.weightedScore = 0;
  }
}

export interface RatingWeights {
  qualityRating: number;
  destinationRating: number;
  valueRating: number;
  accommodationRating: number;
  activitiesRating: number;
}

export interface AlgorithmDetails {
  name: string;
  timeComplexity: string;
  spaceComplexity: string;
  k?: number;
}

export interface RankingAlgorithms {
  fullRanking: AlgorithmDetails;
  topK: AlgorithmDetails;
}

export interface RankingResponse {
  totalTrips: number;
  totalReviewedTrips: number;
  weights: RatingWeights;
  algorithms: RankingAlgorithms;
  topTrips: RankedTrip[];
  rankings: RankedTrip[];
}

const test = require('node:test');
const assert = require('node:assert/strict');

const {
    calculateWeightedScore,
    groupReviewsByTrip,
    mergeSortRankings,
    getTopKTrips
} = require('../utils/rankingAlgorithms');


// ---------------------------------------------------------
// Weighted score tests
// ---------------------------------------------------------

test('calculateWeightedScore returns the expected weighted score', () => {
    const reviews = [
        {
            qualityRating: 4,
            destinationRating: 5,
            valueRating: 4,
            accommodationRating: 5,
            activitiesRating: 4
        }
    ];

    const score = calculateWeightedScore(reviews);

    assert.equal(score, 4.4);
});


test('calculateWeightedScore averages multiple reviews', () => {
    const reviews = [
        {
            qualityRating: 5,
            destinationRating: 5,
            valueRating: 5,
            accommodationRating: 5,
            activitiesRating: 5
        },
        {
            qualityRating: 3,
            destinationRating: 3,
            valueRating: 3,
            accommodationRating: 3,
            activitiesRating: 3
        }
    ];

    const score = calculateWeightedScore(reviews);

    assert.equal(score, 4);
});


test('calculateWeightedScore returns zero for no reviews', () => {
    assert.equal(calculateWeightedScore([]), 0);
});


// ---------------------------------------------------------
// Review grouping test
//
// The Map should collect reviews by trip code so the full
// review collection does not need to be searched repeatedly.
// ---------------------------------------------------------

test('groupReviewsByTrip groups reviews by trip code', () => {
    const reviews = [
        { tripCode: 'TRIP-A', reviewText: 'First' },
        { tripCode: 'TRIP-B', reviewText: 'Second' },
        { tripCode: 'TRIP-A', reviewText: 'Third' }
    ];

    const groupedReviews = groupReviewsByTrip(reviews);

    assert.equal(groupedReviews instanceof Map, true);
    assert.equal(groupedReviews.get('TRIP-A').length, 2);
    assert.equal(groupedReviews.get('TRIP-B').length, 1);
});


// ---------------------------------------------------------
// Merge sort tests
// ---------------------------------------------------------

test('mergeSortRankings orders trips from highest to lowest score', () => {
    const trips = [
        {
            code: 'A',
            name: 'Trip A',
            reviewCount: 5,
            weightedScore: 3.8
        },
        {
            code: 'B',
            name: 'Trip B',
            reviewCount: 3,
            weightedScore: 4.7
        },
        {
            code: 'C',
            name: 'Trip C',
            reviewCount: 7,
            weightedScore: 4.2
        },
        {
            code: 'D',
            name: 'Trip D',
            reviewCount: 4,
            weightedScore: 4.9
        },
        {
            code: 'E',
            name: 'Trip E',
            reviewCount: 6,
            weightedScore: 4.5
        }
    ];

    const result = mergeSortRankings(trips);

    assert.deepEqual(
        result.map((trip) => trip.code),
        ['D', 'B', 'E', 'C', 'A']
    );
});


test('mergeSortRankings uses review count to break score ties', () => {
    const trips = [
        {
            code: 'LOW-COUNT',
            name: 'Low Count Trip',
            reviewCount: 2,
            weightedScore: 4.5
        },
        {
            code: 'HIGH-COUNT',
            name: 'High Count Trip',
            reviewCount: 8,
            weightedScore: 4.5
        }
    ];

    const result = mergeSortRankings(trips);

    assert.equal(result[0].code, 'HIGH-COUNT');
    assert.equal(result[1].code, 'LOW-COUNT');
});


test('mergeSortRankings uses trip name as a final stable tie breaker', () => {
    const trips = [
        {
            code: 'BETA',
            name: 'Beta Trip',
            reviewCount: 5,
            weightedScore: 4.5
        },
        {
            code: 'ALPHA',
            name: 'Alpha Trip',
            reviewCount: 5,
            weightedScore: 4.5
        }
    ];

    const result = mergeSortRankings(trips);

    assert.equal(result[0].code, 'ALPHA');
    assert.equal(result[1].code, 'BETA');
});


// ---------------------------------------------------------
// Top-K min-heap tests
// ---------------------------------------------------------

test('getTopKTrips returns only the three highest-ranked trips', () => {
    const trips = [
        {
            code: 'A',
            name: 'Trip A',
            reviewCount: 5,
            weightedScore: 3.8
        },
        {
            code: 'B',
            name: 'Trip B',
            reviewCount: 3,
            weightedScore: 4.7
        },
        {
            code: 'C',
            name: 'Trip C',
            reviewCount: 7,
            weightedScore: 4.2
        },
        {
            code: 'D',
            name: 'Trip D',
            reviewCount: 4,
            weightedScore: 4.9
        },
        {
            code: 'E',
            name: 'Trip E',
            reviewCount: 6,
            weightedScore: 4.5
        }
    ];

    const result = getTopKTrips(trips, 3);

    assert.deepEqual(
        result.map((trip) => trip.code),
        ['D', 'B', 'E']
    );
});


test('getTopKTrips handles a K value larger than the number of trips', () => {
    const trips = [
        {
            code: 'A',
            name: 'Trip A',
            reviewCount: 2,
            weightedScore: 4.2
        },
        {
            code: 'B',
            name: 'Trip B',
            reviewCount: 3,
            weightedScore: 4.7
        }
    ];

    const result = getTopKTrips(trips, 5);

    assert.equal(result.length, 2);

    assert.deepEqual(
        result.map((trip) => trip.code),
        ['B', 'A']
    );
});


test('getTopKTrips returns an empty array when no trips are provided', () => {
    assert.deepEqual(
        getTopKTrips([], 3),
        []
    );
});
const Trip = require('../models/travlr');
const Review = require('../models/review');

const {
    RATING_WEIGHTS,
    buildTripRankings,
    mergeSortRankings,
    getTopKTrips
} = require('../utils/rankingAlgorithms');

/**
 * GET /api/rankings
 *
 * Creates ranking data from the existing trips and customer reviews.
 *
 * The complete ranking uses merge sort.
 * The Top 3 list uses a min-heap.
 */
const rankingsList = async (req, res) => {
    try {
        const trips = await Trip.find({});
        const reviews = await Review.find({});

        // Combine each trip with its calculated review score.
        const rankingRecords = buildTripRankings(
            trips,
            reviews
        );

        // Trips without reviews cannot be meaningfully ranked yet.
        const reviewedTrips = rankingRecords.filter(
            (trip) => trip.reviewCount > 0
        );

        // Complete ranking using merge sort.
        const sortedRankings =
            mergeSortRankings(reviewedTrips);

        const rankingsWithPosition =
            sortedRankings.map((trip, index) => ({
                rank: index + 1,
                ...trip
            }));

        // Top 3 using the min-heap algorithm.
        const topTrips = getTopKTrips(
            reviewedTrips,
            3
        ).map((trip, index) => ({
            rank: index + 1,
            ...trip
        }));

        return res.status(200).json({
            totalTrips: trips.length,
            totalReviewedTrips: reviewedTrips.length,

            weights: RATING_WEIGHTS,

            algorithms: {
                fullRanking: {
                    name: 'Merge Sort',
                    timeComplexity: 'O(n log n)',
                    spaceComplexity: 'O(n)'
                },

                topK: {
                    name: 'Min-Heap',
                    k: 3,
                    timeComplexity: 'O(n log k)',
                    spaceComplexity: 'O(k)'
                }
            },

            topTrips: topTrips,
            rankings: rankingsWithPosition
        });
    } catch (err) {
        console.error(
            'Unable to calculate trip rankings:',
            err
        );

        return res.status(500).json({
            message: 'Unable to calculate trip rankings.'
        });
    }
};

module.exports = {
    rankingsList
};
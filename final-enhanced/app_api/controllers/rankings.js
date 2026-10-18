const Trip = require('../models/travlr');
const Review = require('../models/review');

const {
    RATING_WEIGHTS,
    mergeSortRankings,
    getTopKTrips
} = require('../utils/rankingAlgorithms');


// ---------------------------------------------------------
// MongoDB review aggregation
//
// Review counts, category averages, and weighted scores are
// calculated inside MongoDB instead of loading every review
// into Node.js and processing the entire collection there.
// ---------------------------------------------------------

const buildReviewAggregationPipeline = () => [
    {
        $group: {
            _id: '$tripCode',

            reviewCount: {
                $sum: 1
            },

            averageValueRating: {
                $avg: '$valueRating'
            },

            averageDestinationRating: {
                $avg: '$destinationRating'
            },

            averageQualityRating: {
                $avg: '$qualityRating'
            },

            averageAccommodationRating: {
                $avg: '$accommodationRating'
            },

            averageActivitiesRating: {
                $avg: '$activitiesRating'
            }
        }
    },

    {
        $project: {
            _id: 0,

            tripCode: '$_id',

            reviewCount: 1,

            averageRatings: {
                valueRating: {
                    $round: [
                        '$averageValueRating',
                        2
                    ]
                },

                destinationRating: {
                    $round: [
                        '$averageDestinationRating',
                        2
                    ]
                },

                qualityRating: {
                    $round: [
                        '$averageQualityRating',
                        2
                    ]
                },

                accommodationRating: {
                    $round: [
                        '$averageAccommodationRating',
                        2
                    ]
                },

                activitiesRating: {
                    $round: [
                        '$averageActivitiesRating',
                        2
                    ]
                }
            },

            /*
             * Because weighted scoring is a linear calculation,
             * the score can be calculated from the category
             * averages without loading individual reviews.
             */
            weightedScore: {
                $round: [
                    {
                        $add: [
                            {
                                $multiply: [
                                    '$averageQualityRating',
                                    RATING_WEIGHTS.qualityRating
                                ]
                            },
                            {
                                $multiply: [
                                    '$averageDestinationRating',
                                    RATING_WEIGHTS.destinationRating
                                ]
                            },
                            {
                                $multiply: [
                                    '$averageValueRating',
                                    RATING_WEIGHTS.valueRating
                                ]
                            },
                            {
                                $multiply: [
                                    '$averageAccommodationRating',
                                    RATING_WEIGHTS.accommodationRating
                                ]
                            },
                            {
                                $multiply: [
                                    '$averageActivitiesRating',
                                    RATING_WEIGHTS.activitiesRating
                                ]
                            }
                        ]
                    },
                    2
                ]
            }
        }
    }
];


// ---------------------------------------------------------
// GET /api/rankings
// ---------------------------------------------------------

const rankingsList = async (req, res) => {
    try {

        /*
         * Trip information and review statistics can be
         * retrieved independently, so both database requests
         * are performed at the same time.
         */
        const [
            trips,
            reviewStatistics
        ] = await Promise.all([
            Trip.find({}).lean(),

            Review.aggregate(
                buildReviewAggregationPipeline()
            )
        ]);


        /*
         * The aggregation pipeline returns one summary record
         * per reviewed trip. A Map makes matching that data to
         * the trip records efficient.
         */
        const statisticsByTrip = new Map(
            reviewStatistics.map(
                (statistics) => [
                    statistics.tripCode,
                    statistics
                ]
            )
        );


        const rankingRecords = trips.map(
            (trip) => {
                const statistics =
                    statisticsByTrip.get(
                        trip.code
                    );

                return {
                    code: trip.code,
                    name: trip.name,
                    resort: trip.resort,
                    image: trip.image,

                    reviewCount:
                        statistics
                            ? statistics.reviewCount
                            : 0,

                    weightedScore:
                        statistics
                            ? statistics.weightedScore
                            : 0,

                    averageRatings:
                        statistics
                            ? statistics.averageRatings
                            : null
                };
            }
        );


        // Trips without reviews cannot be ranked yet.
        const reviewedTrips = rankingRecords.filter(
            (trip) => trip.reviewCount > 0
        );


        // Milestone Three algorithm:
        // complete ranking using merge sort.
        const sortedRankings =
            mergeSortRankings(reviewedTrips);


        const rankingsWithPosition =
            sortedRankings.map(
                (trip, index) => ({
                    rank: index + 1,
                    ...trip
                })
            );


        // Milestone Three algorithm:
        // Top 3 selection using a min-heap.
        const topTrips = getTopKTrips(
            reviewedTrips,
            3
        ).map(
            (trip, index) => ({
                rank: index + 1,
                ...trip
            })
        );


        return res.status(200).json({
            totalTrips: trips.length,

            totalReviewedTrips:
                reviewedTrips.length,

            weights: RATING_WEIGHTS,

            /*
             * This metadata documents where the review
             * calculations are now performed.
             */
            databaseProcessing: {
                method:
                    'MongoDB Aggregation Pipeline',

                operations: [
                    '$group',
                    '$avg',
                    '$sum',
                    '$project',
                    '$round'
                ],

                description:
                    'MongoDB calculates review counts, category averages, and weighted scores before the ranking data is returned to Node.js.'
            },

            algorithms: {
                fullRanking: {
                    name: 'Merge Sort',
                    timeComplexity:
                        'O(n log n)',
                    spaceComplexity:
                        'O(n)'
                },

                topK: {
                    name: 'Min-Heap',
                    k: 3,
                    timeComplexity:
                        'O(n log k)',
                    spaceComplexity:
                        'O(k)'
                }
            },

            topTrips: topTrips,
            rankings:
                rankingsWithPosition
        });

    } catch (err) {
        console.error(
            'Unable to calculate trip rankings:',
            err
        );

        return res.status(500).json({
            message:
                'Unable to calculate trip rankings.'
        });
    }
};


module.exports = {
    rankingsList,
    buildReviewAggregationPipeline
};
const mongoose = require('mongoose');


// Creates a rating field that requires a whole number from 1 through 5.
const ratingField = () => ({
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
        validator: Number.isInteger,
        message: 'Rating must be a whole number from 1 through 5.'
    }
});


const reviewSchema = new mongoose.Schema(
    {
        // The trip code links each review to a specific trip.
        // It cannot be changed after the review is created.
        tripCode: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            immutable: true
        },

        // The authenticated user's MongoDB ID establishes ownership.
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'users',
            immutable: true
        },

        // Store the user's display name with the review.
        userName: {
            type: String,
            required: true,
            trim: true
        },

        valueRating: ratingField(),
        destinationRating: ratingField(),
        qualityRating: ratingField(),
        accommodationRating: ratingField(),
        activitiesRating: ratingField(),

        reviewText: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: ''
        }
    },
    {
        timestamps: true
    }
);


// ---------------------------------------------------------
// Database indexes
// ---------------------------------------------------------

// Enforce the one-review-per-user-per-trip rule at the
// database level, even if two requests reach the server
// at nearly the same time.
reviewSchema.index(
    {
        tripCode: 1,
        userId: 1
    },
    {
        unique: true,
        name: 'unique_user_trip_review'
    }
);


// Optimize the common query that displays the newest
// reviews for a particular trip.
reviewSchema.index(
    {
        tripCode: 1,
        createdAt: -1
    },
    {
        name: 'reviews_by_trip_recent'
    }
);


// Support efficient lookup of a user's reviews.
reviewSchema.index(
    {
        userId: 1,
        updatedAt: -1
    },
    {
        name: 'reviews_by_user_recent'
    }
);


const Review = mongoose.model(
    'reviews',
    reviewSchema
);

module.exports = Review;
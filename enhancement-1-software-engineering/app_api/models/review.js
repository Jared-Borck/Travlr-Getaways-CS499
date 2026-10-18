const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        tripCode: {
            type: String,
            required: true,
            trim: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'users'
        },

        userName: {
            type: String,
            required: true,
            trim: true
        },

        valueRating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        destinationRating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        qualityRating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        accommodationRating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        activitiesRating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

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

const Review = mongoose.model('reviews', reviewSchema);

module.exports = Review;
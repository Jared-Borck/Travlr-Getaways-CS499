const mongoose = require('mongoose');
const Review = require('../models/review');


// Validate that a rating is a whole number from 1 through 5.
const validRating = (rating) => {
    const value = Number(rating);

    return Number.isInteger(value) &&
        value >= 1 &&
        value <= 5;
};


// Validate all required review fields before saving.
const validateReview = (body) => {
    if (
        !validRating(body.valueRating) ||
        !validRating(body.destinationRating) ||
        !validRating(body.qualityRating) ||
        !validRating(body.accommodationRating) ||
        !validRating(body.activitiesRating)
    ) {
        return 'All ratings must be whole numbers from 1 through 5.';
    }

    // Written review text is optional.
    if (
        typeof body.reviewText === 'string' &&
        body.reviewText.trim().length > 2000
    ) {
        return 'Review text cannot exceed 2000 characters.';
    }

    return null;
};


// Safely prepare optional review text.
const getReviewText = (body) => {
    if (typeof body.reviewText !== 'string') {
        return '';
    }

    return body.reviewText.trim();
};


// Normalize trip codes before using them in database queries.
const normalizeTripCode = (tripCode) => {
    if (typeof tripCode !== 'string') {
        return '';
    }

    return tripCode.trim().toUpperCase();
};


/*
 * Handles database errors that should return a specific
 * client response instead of a generic server error.
 */
const handleDatabaseError = (err, res, fallbackMessage) => {

    // MongoDB duplicate-key error.
    // The compound index guarantees one review per user per trip.
    if (err && err.code === 11000) {
        return res.status(409).json({
            message: 'You have already reviewed this trip.'
        });
    }

    // Mongoose schema validation failure.
    if (err && err.name === 'ValidationError') {
        const messages = Object.values(err.errors)
            .map((error) => error.message);

        return res.status(400).json({
            message: messages.join(' ')
        });
    }

    console.error(fallbackMessage, err);

    return res.status(500).json({
        message: fallbackMessage
    });
};


// ---------------------------------------------------------
// GET all reviews for one trip
// ---------------------------------------------------------

const reviewsByTrip = async (req, res) => {
    const tripCode = normalizeTripCode(
        req.params.tripCode
    );

    if (!tripCode) {
        return res.status(400).json({
            message: 'Trip code is required.'
        });
    }

    try {
        const reviews = await Review
            .find({
                tripCode: tripCode
            })
            .sort({
                createdAt: -1
            });

        return res
            .status(200)
            .json(reviews);

    } catch (err) {
        return handleDatabaseError(
            err,
            res,
            'Unable to retrieve reviews.'
        );
    }
};


// ---------------------------------------------------------
// POST a new review
// ---------------------------------------------------------

const reviewsCreate = async (req, res) => {
    const tripCode = normalizeTripCode(
        req.params.tripCode
    );

    if (
        !req.auth ||
        !req.auth._id ||
        !req.auth.name
    ) {
        return res.status(401).json({
            message: 'Authentication required.'
        });
    }

    if (!tripCode) {
        return res.status(400).json({
            message: 'Trip code is required.'
        });
    }

    const validationError = validateReview(
        req.body
    );

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    try {

        /*
         * Keep the application-level check because it provides
         * an immediate friendly response.
         *
         * The database unique index remains the final authority
         * if simultaneous requests reach this point together.
         */
        const existingReview = await Review.findOne({
            tripCode: tripCode,
            userId: req.auth._id
        });

        if (existingReview) {
            return res.status(409).json({
                message:
                    'You have already reviewed this trip.'
            });
        }

        const review = await Review.create({
            tripCode: tripCode,
            userId: req.auth._id,
            userName: req.auth.name,

            valueRating:
                Number(req.body.valueRating),

            destinationRating:
                Number(req.body.destinationRating),

            qualityRating:
                Number(req.body.qualityRating),

            accommodationRating:
                Number(req.body.accommodationRating),

            activitiesRating:
                Number(req.body.activitiesRating),

            reviewText:
                getReviewText(req.body)
        });

        return res
            .status(201)
            .json(review);

    } catch (err) {
        return handleDatabaseError(
            err,
            res,
            'Unable to create review.'
        );
    }
};


// ---------------------------------------------------------
// PUT an existing review
// ---------------------------------------------------------

const reviewsUpdate = async (req, res) => {
    const reviewId = req.params.reviewId;

    if (
        !req.auth ||
        !req.auth._id
    ) {
        return res.status(401).json({
            message: 'Authentication required.'
        });
    }

    if (!reviewId) {
        return res.status(400).json({
            message: 'Review ID is required.'
        });
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            reviewId
        )
    ) {
        return res.status(400).json({
            message: 'Invalid review ID.'
        });
    }

    const validationError = validateReview(
        req.body
    );

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    try {
        const review = await Review.findById(
            reviewId
        );

        if (!review) {
            return res.status(404).json({
                message: 'Review not found.'
            });
        }

        if (
            review.userId.toString() !==
            req.auth._id
        ) {
            return res.status(403).json({
                message:
                    'You may only edit your own reviews.'
            });
        }

        review.valueRating =
            Number(req.body.valueRating);

        review.destinationRating =
            Number(req.body.destinationRating);

        review.qualityRating =
            Number(req.body.qualityRating);

        review.accommodationRating =
            Number(req.body.accommodationRating);

        review.activitiesRating =
            Number(req.body.activitiesRating);

        review.reviewText =
            getReviewText(req.body);

        const updatedReview =
            await review.save();

        return res
            .status(200)
            .json(updatedReview);

    } catch (err) {
        return handleDatabaseError(
            err,
            res,
            'Unable to update review.'
        );
    }
};


// ---------------------------------------------------------
// DELETE an existing review
// ---------------------------------------------------------

const reviewsDelete = async (req, res) => {
    const reviewId = req.params.reviewId;

    if (
        !req.auth ||
        !req.auth._id
    ) {
        return res.status(401).json({
            message: 'Authentication required.'
        });
    }

    if (!reviewId) {
        return res.status(400).json({
            message: 'Review ID is required.'
        });
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            reviewId
        )
    ) {
        return res.status(400).json({
            message: 'Invalid review ID.'
        });
    }

    try {
        const review = await Review.findById(
            reviewId
        );

        if (!review) {
            return res.status(404).json({
                message: 'Review not found.'
            });
        }

        if (
            review.userId.toString() !==
            req.auth._id
        ) {
            return res.status(403).json({
                message:
                    'You may only delete your own reviews.'
            });
        }

        await Review.deleteOne({
            _id: reviewId
        });

        return res.status(204).send();

    } catch (err) {
        return handleDatabaseError(
            err,
            res,
            'Unable to delete review.'
        );
    }
};


module.exports = {
    reviewsByTrip,
    reviewsCreate,
    reviewsUpdate,
    reviewsDelete
};
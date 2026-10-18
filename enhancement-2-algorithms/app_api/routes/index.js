const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const tripsController = require('../controllers/trips');
const authController = require('../controllers/authentication');
const reviewsController = require('../controllers/reviews');
const rankingsController = require('../controllers/rankings');

// Authenticate a JSON Web Token.
function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: 'Authorization header required'
        });
    }

    // Authorization header should use:
    // Bearer <token>
    const parts = authHeader.trim().split(/\s+/);

    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        return res.status(401).json({
            message: 'Authorization header must use Bearer token'
        });
    }

    const token = parts[1];

    if (!token) {
        return res.status(401).json({
            message: 'Authentication token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, verified) => {
        if (err) {
            return res.status(401).json({
                message: 'Invalid or expired authentication token'
            });
        }

        // Store the verified JWT information on the request.
        req.auth = verified;
        next();
    });
}

// Require the authenticated user to be an administrator.
function requireAdmin(req, res, next) {
    if (!req.auth) {
        return res.status(401).json({
            message: 'Authentication required'
        });
    }

    if (req.auth.role !== 'admin') {
        return res.status(403).json({
            message: 'Administrator access required'
        });
    }

    next();
}

// Trip routes.
//
// Reading trip information remains public.
// Creating, updating, and deleting trips requires an administrator.
router
    .route('/trips')
    .get(tripsController.tripsList)
    .post(
        authenticateJWT,
        requireAdmin,
        tripsController.tripsAddTrip
    );

router
    .route('/trips/:tripCode')
    .get(tripsController.tripsFindByCode)
    .put(
        authenticateJWT,
        requireAdmin,
        tripsController.tripsUpdateTrip
    )
    .delete(
        authenticateJWT,
        requireAdmin,
        tripsController.tripsDeleteTrip
    );

// Review routes.
//
// Anyone can view reviews for a trip.
// A logged-in user can create a review.
router
    .route('/trips/:tripCode/reviews')
    .get(reviewsController.reviewsByTrip)
    .post(
        authenticateJWT,
        reviewsController.reviewsCreate
    );

// A logged-in user can edit or delete only their own review.
// Ownership is checked inside the review controller.
router
    .route('/reviews/:reviewId')
    .put(
        authenticateJWT,
        reviewsController.reviewsUpdate
    )
    .delete(
        authenticateJWT,
        reviewsController.reviewsDelete
    );

// Ranking route.
//
// Rankings are public because they are calculated from
// publicly viewable trip and review information.
router
    .route('/rankings')
    .get(rankingsController.rankingsList);

// Authentication routes.
router
    .route('/register')
    .post(authController.register);

router
    .route('/login')
    .post(authController.login);

module.exports = router;
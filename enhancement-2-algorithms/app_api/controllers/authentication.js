const User = require('../models/user');
const passport = require('passport');

const register = async (req, res) => {
    // Make sure all required fields are present.
    if (!req.body.name || !req.body.email || !req.body.password) {
        return res
            .status(400)
            .json({ message: 'All fields required' });
    }

    try {
        // New accounts always begin as customers.
        // Do not accept a role from the request body.
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            role: 'customer'
        });

        user.setPassword(req.body.password);

        await user.save();

        // Return the token using the same structure as login.
        const token = user.generateJWT();

        return res
            .status(201)
            .json({ token });
    } catch (err) {
        // MongoDB duplicate key error - email already exists.
        if (err && err.code === 11000) {
            return res
                .status(409)
                .json({ message: 'Email address is already registered' });
        }

        console.error('Registration error:', err);

        return res
            .status(500)
            .json({ message: 'Unable to register user' });
    }
};

const login = (req, res) => {
    // Make sure email and password are present.
    if (!req.body.email || !req.body.password) {
        return res
            .status(400)
            .json({ message: 'All fields required' });
    }

    // Delegate authentication to Passport.
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Login error:', err);

            return res
                .status(500)
                .json({ message: 'Unable to log in' });
        }

        if (!user) {
            return res
                .status(401)
                .json(info || { message: 'Invalid email or password' });
        }

        // Authentication succeeded - generate JWT.
        const token = user.generateJWT();

        return res
            .status(200)
            .json({ token });
    })(req, res);
};

module.exports = {
    register,
    login
};
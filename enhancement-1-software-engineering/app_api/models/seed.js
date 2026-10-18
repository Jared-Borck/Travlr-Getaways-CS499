const mongoose = require('mongoose');
const Trip = require('./travlr');
require('./db');

const trips = require('../../data/trips.json');

const seedDB = async () => {
  try {
    await Trip.deleteMany({});
    await Trip.insertMany(trips);
    console.log('Database seeded successfully.');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
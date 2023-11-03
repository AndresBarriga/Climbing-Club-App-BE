// gearRentalRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('clerk');

// Sample gear rental data (replace with your actual data)
const gearRentalData = [
  { name: 'Gear Option 1', description: 'Description 1', price: 50 },
  { name: 'Gear Option 2', description: 'Description 2', price: 75 },
  // Add more gear rental options
];

// Route handler for viewing available gear rental options
router.get('/gear-rental', authMiddleware, (req, res) => {
  // Implement logic to retrieve gear rental data from your database or source
  // For this example, we're using sample data
  res.status(200).json(gearRentalData);
});

module.exports = router;
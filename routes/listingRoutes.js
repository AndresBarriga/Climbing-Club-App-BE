

const express = require('express');
const router = express.Router();

// Sample gym/mountain data (replace with your actual data)
const gymMountainData = [
  { name: 'Gym/Mountain 1', location: 'Location 1' },
  { name: 'Gym/Mountain 2', location: 'Location 2' },
  // Add more gym/mountain entries
];

// Route handler for retrieving gym/mountain listings
router.get('/listing', (req, res) => {
  // Implement logic to retrieve gym/mountain data from your database or source
  // For this example, we're using sample data
  res.status(200).json(gymMountainData);
});

module.exports = router
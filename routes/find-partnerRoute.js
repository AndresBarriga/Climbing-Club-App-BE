// findPartnerRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('clerk');

// Sample climbing partner data (replace with your actual data)
const climbingPartners = [
  { name: 'Climber 1', location: 'Location 1', experience: 'Intermediate', climbingStyle: 'Bouldering' },
  { name: 'Climber 2', location: 'Location 2', experience: 'Advanced', climbingStyle: 'Sport' },
  // Add more climbing partner profiles
];

// Route handler for finding climbing partners based on criteria
router.get('/find-partner', authMiddleware, (req, res) => {
  // Implement logic to filter and retrieve climbing partner data based on search criteria
  // For this example, we're using sample data
  const { location, experienceLevel, climbingStyle } = req.query;
  const filteredPartners = climbingPartners.filter((partner) => {
    return (
      (!location || partner.location === location) &&
      (!experienceLevel || partner.experience === experienceLevel) &&
      (!climbingStyle || partner.climbingStyle === climbingStyle)
    );
  });

  res.status(200).json(filteredPartners);
});

module.exports = router;

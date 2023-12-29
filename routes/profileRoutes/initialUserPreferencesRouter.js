import express from 'express';
import Pool from 'pg-pool';
import authenticateToken from './authenticateToken.js';
import multer from 'multer';
import cloudinary from './cloudinaryConfig.js';

import dotenv from 'dotenv';

dotenv.config();

// Set up PostgreSQL connection
const isProduction = process.env.NODE_ENV === 'production';
const pgPool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : 'postgres://postgres:5813@localhost:5432/climbing',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

const initialUserPreferencesRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Define the POST route for initial user preferences
initialUserPreferencesRouter.post('/', authenticateToken ,(req, res) => {
  // Extract the user_id from the request
  const user_id = req.user_id;
  const { gender, birthday, location, climbingStyle, belayerDevice, climberType, material, climbingGradesBoulder, climbingGradesClimbing, favoriteClimbingDestinations, routePreferences, climbingPhilosophy, routeWishList } = req.body;

  // SQL query to insert the user preferences into the database
  const sql = `INSERT INTO user_preferences (user_id, gender, birthday, location, climbing_style, preferred_belayer_device, type_of_climber, climbing_equipment, climbing_grades_boulder, climbing_grades_climbing, favorite_climbing_destinations, route_preferences, climbing_philosophy, route_wish_list) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`;
  const values = [user_id, gender, birthday, location, climbingStyle, belayerDevice, climberType, material, climbingGradesBoulder, climbingGradesClimbing, favoriteClimbingDestinations, routePreferences, climbingPhilosophy, routeWishList];

  // Execute the SQL query
  pgPool.query(sql, values, (err, data) => {
    // Handle any errors during the query
    if (err) {
      console.error(err);
      return res.status(500).json("Error saving user preferences");
    }

    // SQL query to update the user's initial_preferences flag so that this page will not render more for the user
    const sqlUpdate = `UPDATE users SET initial_preferences = true WHERE user_id = $1`;
    const valuesUpdate = [user_id];

    // Execute the SQL query
    pgPool.query(sqlUpdate, valuesUpdate, (errUpdate, dataUpdate) => {
      // Handle any errors during the query
      if (errUpdate) {
        console.error(errUpdate);
        return res.status(500).json("Error updating user preferences");
      }

      // If the query is successful, return a success response
      return res.json("User preferences saved successfully");
    });
  });
});

// Define a POST route for uploading profile pictures
initialUserPreferencesRouter.post('/profile-picture', authenticateToken, upload.single('file'), async (req, res) => {
  // Log that the route was hit and the file received in the request
  console.log("Profile pic route was hit")
  console.log('Request File:', req.file);

  try {
    // Upload the received file to Cloudinary
    // The file is converted to a base64 string before being uploaded
    const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`);

    // SQL query to update the profile picture URL in the users table
    const sqlUpdate = `UPDATE users SET profile_picture = $1 WHERE user_id = $2`;
    // Values to be used in the SQL query
    const valuesUpdate = [result.secure_url, req.user_id];

    // Execute the SQL query
    pgPool.query(sqlUpdate, valuesUpdate, (errUpdate, dataUpdate) => {
      
      if (errUpdate) {
        console.error(errUpdate);
        return res.status(500).json("Error updating user profile picture");
      }

      
      return res.json("Profile picture uploaded successfully");
    });
  } catch (err) {
    // If there's an error uploading the image to Cloudinary, log it and send a 500 response
    console.error(err);
    return res.status(500).json("Error uploading image");
  }
});

// Export the router
export default initialUserPreferencesRouter;
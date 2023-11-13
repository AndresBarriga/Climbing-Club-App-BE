import express from 'express';
import Pool from 'pg-pool';
import authenticateToken from './authenticateToken.js';

// Set up PostgreSQL connection
const pgPool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "climbing",
  password: "5813",
  port: 5432,
})

const initialUserPreferencesRouter = express.Router();

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

export default initialUserPreferencesRouter;
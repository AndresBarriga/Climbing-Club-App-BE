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


const editUserProfileRouter = express.Router();

// Define the PUT route for updating user preferences
editUserProfileRouter.put('/', authenticateToken ,(req, res) => {
  // Extract the user_id from the request
  console.log("edit profile route was hit")
  const user_id = req.user_id;
  const { gender, birthday, location, climbing_style, preferred_belayer_device, type_of_climber, climbing_equipment, climbing_grades_boulder, climbing_grades_climbing, favorite_climbing_destinations, route_preferences, climbing_philosophy, route_whish_list, bio } = req.body;
  // SQL query to update the user preferences in the database
  const sql = `UPDATE user_preferences SET gender = $2, birthday = $3, location = $4, climbing_style = $5, preferred_belayer_device = $6, type_of_climber = $7, climbing_equipment = $8, climbing_grades_boulder = $9, climbing_grades_climbing = $10, favorite_climbing_destinations = $11, route_preferences = $12, climbing_philosophy = $13, route_wish_list = $14, bio=$15 WHERE user_id = $1`;
  const values = [user_id, gender, birthday, location, climbing_style, preferred_belayer_device, type_of_climber, climbing_equipment, climbing_grades_boulder, climbing_grades_climbing, favorite_climbing_destinations, route_preferences, climbing_philosophy, route_whish_list, bio];

  // Execute the SQL query
  pgPool.query(sql, values, (err, data) => {
    // Handle any errors during the query
    if (err) {
      console.error(err);
      return res.status(500).json("Error updating user preferences");
    }

    // If the query is successful, return a success response
    return res.json("User preferences updated successfully");
  });
});

export default editUserProfileRouter;
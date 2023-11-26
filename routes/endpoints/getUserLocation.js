import express from 'express';
import Pool from 'pg-pool';
import authenticateToken from '../profileRoutes/authenticateToken.js';

// Set up PostgreSQL connection
const pgPool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "climbing",
  password: "5813",
  port: 5432,
})

const getUserLocation = express.Router();

// Define the GET route for showing user profile
getUserLocation.get('/', authenticateToken, (req, res) => {

  console.log("show profile route was hit")
  // Extract the user_id from the request
  const user_id = req.user_id;

  // SQL query to get the user details from the database
  const sqlUser = `SELECT location FROM user_preferences WHERE user_id = \$1`;
  const valuesUser = [user_id];
  pgPool.query(sqlUser, valuesUser, (errUser, dataPreferences) => {
    if (errUser) {
      console.error(errUser);
      return res.status(500).json("Error fetching user details");
    }
      console.log({  preferences: dataPreferences.rows[0] });
      // Send the fetched data back to the client
      res.json({ preferences: dataPreferences.rows[0] });
    });
  });

  

export default getUserLocation;
import express from 'express';
import Pool from 'pg-pool';

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
initialUserPreferencesRouter.post('/', (req, res) => {
  // Extract the user_id from the request
  const user_id = req.user.user_id;

  // SQL query to insert the user preferences into the database
  const sql = "INSERT INTO user_preferences (user_id) VALUES ($1)";
  const values = [user_id];

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
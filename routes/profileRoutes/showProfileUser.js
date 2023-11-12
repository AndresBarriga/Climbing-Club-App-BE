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

const showProfileRouter = express.Router();

// Define the GET route for showing user profile
showProfileRouter.get('/', (req, res) => {
  // Extract the user_id from the request
  const user_id = req.user.user_id;

  // SQL query to get the user details from the database
  const sql = "SELECT * FROM users WHERE user_id = $1";
  const values = [user_id];

  // Execute the SQL query
  pgPool.query(sql, values, (err, data) => {
    // Handle any errors during the query
    if (err) {
      console.error(err);
      return res.status(500).json("Error fetching user details");
    }

    // If the query is successful, return the user details
    const userDetails = data.rows[0];
    return res.json(userDetails);
  });
});

export default showProfileRouter;
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

const logoutRouter = express.Router();

// Define the DELETE route for logout
logoutRouter.delete('/', (req, res) => {
  
  // If a session ID exists
  if (req.sessionID) {
    console.log(`Deleting session with SID: ${req.sessionID}`);
    const deleteSessionSql = "DELETE FROM session WHERE sid = $1";
    const deleteSessionValues = [req.sessionID];

    // Perform the SQL operation
    pgPool.query(deleteSessionSql, deleteSessionValues, (dbErr) => {
      // Handle any errors during the query
      if (dbErr) {
        console.error(dbErr);
        return res.status(500).json("Log Out Failed - database error");
      }

      // Log that the session was destroyed & send json response
      console.log('Session destroyed');
      res.json("Logged Out");
    });
  } else {
    // If no session ID exists, log an error and return an error response
    console.log("No valid sid found, can't delete session");
    res.status(400).json("No valid sid found");
  }
});

export default logoutRouter;
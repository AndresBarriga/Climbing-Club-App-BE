import express from 'express';
import Pool from 'pg-pool';

const pgPool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "climbing",
  password: "5813",
  port: 5432,
})


const logoutRouter = express.Router();

logoutRouter.delete('/', (req, res) => {
  console.log("This is the sid in logout route IN function", req.sessionID);
  
  if (req.sessionID) {
    console.log(`Deleting session with SID: ${req.sessionID}`);
    const deleteSessionSql = "DELETE FROM session WHERE sid = $1";
    const deleteSessionValues = [req.sessionID];

    // Perform the SQL operation
    pgPool.query(deleteSessionSql, deleteSessionValues, (dbErr) => {
      if (dbErr) {
        console.error(dbErr);
        return res.status(500).json("Log Out Failed - database error");
      }

      // Destroy the user's session
     
        console.log('Session destroyed');
        res.json("Logged Out");
      
    });
  } else {
    console.log("No valid sid found, can't delete session");
    res.status(400).json("No valid sid found");
  }
});

export default logoutRouter;
import express from 'express';
import Pool from 'pg-pool';
import authenticateToken from '../profileRoutes/authenticateToken.js';
import dotenv from 'dotenv';

dotenv.config();

// Set up PostgreSQL connection
const isProduction = process.env.NODE_ENV === 'production';
const pgPool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : 'postgres://postgres:5813@localhost:5432/climbing',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

const getRequestRouter = express.Router();

getRequestRouter.get('/', authenticateToken, (req, res) => {
  // Extract the request_id from the request parameters
  const user_id = req.user_id;

  // SQL query to get the request information
  const getRequestQuery = 'SELECT * FROM requests_info WHERE user_id = $1';

  pgPool.query(getRequestQuery, [user_id], (err, response) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    } else {
      // Send the request information in the response
      res.json(response.rows);
    }
  });
});


getRequestRouter.get('/:uid', authenticateToken, (req, res) => {
  console.log("route i want was hit")
  // Extract the request_id from the request parameters
  const uid = req.params.uid;
  
  // SQL query to get the request information
  const getRequestQuery = 'SELECT * FROM requests_info WHERE uid = $1';

  pgPool.query(getRequestQuery, [uid], (err, response) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    } else {
      // Send the request information in the response
      res.json(response.rows[0]);
    }
  });
});

export default getRequestRouter;
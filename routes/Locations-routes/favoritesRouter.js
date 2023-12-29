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

const userFavouritesRouter = express.Router();

// Define the PUT route for updating user favourites
userFavouritesRouter.put('/', authenticateToken, (req, res) => {
  // Extract the user_id from the request
  const user_id = req.user_id;
  const { route_id } = req.body;

  const checkFavouriteQuery = 'SELECT * FROM user_favourites WHERE user_id = $1 AND route_id = $2';

  pgPool.query(checkFavouriteQuery, [user_id, route_id], (checkErr, checkRes) => {
    if (checkErr) {
      console.error(checkErr);
      res.status(500).json({ error: 'Database error' });
    } else {
      if (checkRes.rows.length > 0) {
        // If the route is already a favourite, remove it
        const deleteQuery = 'DELETE FROM user_favourites WHERE user_id = $1 AND route_id = $2';
        
        pgPool.query(deleteQuery, [user_id, route_id], (deleteErr, deleteRes) => {
          if (deleteErr) {sn
            console.error(deleteErr);
            res.status(500).json({ error: 'Database error' });
          } else {
            res.json({ message: 'Favourite removed successfully' });
          }
        });
      } else {const insertQuery = 'INSERT INTO user_favourites (user_id, route_id) VALUES ($1, $2)';
        
      pgPool.query(insertQuery, [user_id, route_id], (insertErr, insertRes) => {
        if (insertErr) {
          console.error(insertErr);
          res.status(500).json({ error: 'Database error' });
        } else {
          res.json({ message: 'Favourite added successfully' });
        }
      });
    }
  }
});
});


export default userFavouritesRouter;
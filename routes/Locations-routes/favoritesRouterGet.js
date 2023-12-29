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


const userFavouritesGetRouter = express.Router();


userFavouritesGetRouter.get('/', authenticateToken, (req, res) => {
    // Extract the user_id from the request

    console.log("Get route fav was hit")
    const user_id = req.user_id;
  
    // SQL query to get the user's favourite routes
    const getFavouritesQuery = 'SELECT route_id FROM user_favourites WHERE user_id = $1';
  
    pgPool.query(getFavouritesQuery, [user_id], (getErr, getRes) => {
      if (getErr) {
        console.error(getErr);
        res.status(500).json({ error: 'Database error' });
      } else {
        // Send the favourite route IDs in the response
        
        const favouriteIds = getRes.rows.map(row => row.route_id);
        console.log(favouriteIds)
        res.json(favouriteIds);
      }
    });
  });

  userFavouritesGetRouter.get('/route/:route_id', authenticateToken, (req, res) => {
    // Extract the route_id from the request parameters
    const route_id = req.params.route_id;

    // SQL query to get the route information
    const getRouteQuery = 'SELECT * FROM routes WHERE id = $1';

    pgPool.query(getRouteQuery, [route_id], (getErr, getRes) => {
      if (getErr) {
        console.error(getErr);
        res.status(500).json({ error: 'Database error' });
      } else {
        // Send the route information in the response
        res.json(getRes.rows[0]);
      }
    });
});


export default userFavouritesGetRouter;
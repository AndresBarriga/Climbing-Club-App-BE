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



export default userFavouritesGetRouter;
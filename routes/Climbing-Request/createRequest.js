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

const createRequestRouter = express.Router();


createRequestRouter.post('/', authenticateToken, (req, res) => {

    // Extract the user_id from the request
    const user_id = req.user_id;
    const { timestamp, expiration_date, area, region, areaChecked, selectedRoutes, timeData, climbingStyle, material, neededMaterial, message } = req.body;
    // SQL query to insert the user preferences into the database
    const sql = `
  INSERT INTO requests_info 
  (user_id, timestamp, expiration_date, area, region, area_checked, selected_routes, time_data, climbing_style, material, needed_material, message) 
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  RETURNING uid
`; const values = [
        user_id,
        timestamp,
        expiration_date,
        area,
        region,
        areaChecked,  // Adjust the position to match the order in the SQL query
        selectedRoutes,
        timeData,
        climbingStyle,
        material,
        neededMaterial,
        message
    ];
  
  console.log("Prepared SQL query and values");

  // Execute the SQL query
  pgPool.query(sql, values, async (err, data) => {
    // Handle any errors during the query
    if (err) {
        console.error(err);
        return res.status(500).json("Error saving user preferences");
    }
    console.log("Executed SQL query successfully");
    console.log(data); // Log the data object

    const uid = data.rows[0].uid;

    console.log("Original selectedRoutes: ", selectedRoutes); // Log the original selectedRoutes array
const routeNames = selectedRoutes.map(route => route.name);
console.log("Mapped selectedRoutes to routeNames: ", routeNames);

    const routeIds = [];
    let sqlGetFavoriteUsers = '';
    let valuesGetFavoriteUsers = [];

    for (let routeName of routeNames) {
      const routeId = await getRouteIdByName(routeName);
      console.log(`Route name: ${routeName}, Route ID: ${routeId}`);
      routeIds.push(routeId);
      sqlGetFavoriteUsers = `
      SELECT user_id FROM user_favourites WHERE route_id = $1
      `; 
      const valuesGetFavoriteUsers = [routeId];
      console.log("Prepared SQL query to get favorite users and values");
      const data = await pgPool.query(sqlGetFavoriteUsers, valuesGetFavoriteUsers);
      console.log(`Route ID: ${routeId} Favorite Users: ${data.rows.map(row => row.user_id)}`);

      
  

      if (data.rows.length > 0) {
        // Create a new notification for each user
        for (let i = 0; i < data.rows.length; i++) {
         const userId = data.rows[i].user_id;
         console.log(`Processing user ${userId} for route ${routeName}`);
         if (userId !== req.user_id) {
            await createNotification(userId, uid, `There is a new climbing request for your fav location: ${routeName}!`);
         }
        }
     }
    }
       return res.json("User preferences saved successfully");
    });
  });

    
async function createNotification(userId, uid, routeName) {


  const sqlCreateNotification = `
      INSERT INTO notifications (user_id, type, content, read, created_at, request_id) 
      VALUES ($1, 'new_request', $2, false, NOW(), $3)
  `;
  const valuesCreateNotification = [userId, routeName, uid];

  try {
      await pgPool.query(sqlCreateNotification, valuesCreateNotification);
  } catch (err) {
      console.error(err);
      throw err;
  }
}
    async function getRouteIdByName(routeName) {
        const sql = `SELECT id FROM routes WHERE name = $1`;
        const values = [routeName];
    
        try {
            const result = await pgPool.query(sql, values);
            if (result.rows.length > 0) {
               return result.rows[0].id;
            } else {
               throw new Error(`No route found with name ${routeName}`);
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

// Export the router
export default createRequestRouter;
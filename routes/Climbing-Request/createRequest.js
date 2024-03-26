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
  const { timestamp, expiration_date, area, region, areaChecked, selectedRoutes, route, route_style, timeData, climbingStyle, material, neededMaterial, message } = req.body;

  // If selectedRoutes is undefined, use the route property instead (creating from wizard vs from map)
  const routes = selectedRoutes || (route ? [{ name: route, route_style: route_style }] : []);
  
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
    areaChecked,  
    routes,
    timeData,
    climbingStyle,
    material,
    neededMaterial,
    message
  ];
  console.log("VALUES ARE" ,values)

  // Execute the SQL query
  pgPool.query(sql, values, async (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json("Error saving user preferences");
    }

    const uid = data.rows[0].uid;

    console.log("Original selectedRoutes: ", routes); 
    const routeNames = routes.map(route => route.name);
  
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
      const data = await pgPool.query(sqlGetFavoriteUsers, valuesGetFavoriteUsers);
      console.log(`Route ID: ${routeId} Favorite Users: ${data.rows.map(row => row.user_id)}`);

      if (data.rows.length > 0) {
        // Loop through each favorite user
    for (let i =  0; i < data.rows.length; i++) {
      const userId = data.rows[i].user_id; // Define userId here
      console.log(`Processing user ${userId} for route ${routeName}`);

      // Get the user's notification settings
      const userNotificationSettings = await getUserNotificationSettings(userId);

      // Check if favouritePlaces is enabled
      if (userNotificationSettings && userNotificationSettings.favouritePlaces) {
        // Create a new notification for the user
        if (userId !== req.user_id) {
          await createNotification(userId, uid, `There is a new climbing request for your fav location: ${routeName}!`);
        }
      }else {
        console.log(`User ${userId} does not have favourite places notifications enabled.`);
      }
    }
  }
    return res.json("User preferences saved successfully");
  }});
});

async function getUserNotificationSettings(userId) {
  const sql = `SELECT preference_value FROM notification_preferences WHERE user_id = $1`;
  const values = [userId];

  try {
    const result = await pgPool.query(sql, values);
    if (result.rows.length >   0) {
      // Check if preference_value is already an object
      if (typeof result.rows[0].preference_value === 'string') {
        // Parse the JSON string into a JavaScript object
        return JSON.parse(result.rows[0].preference_value);
      } else {
        // Return the object directly if it's already an object
        return result.rows[0].preference_value;
      }
    } else {
      return {
        favouritePlaces: true,
        friendsRequest: true,
        newLocation: true
      };
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

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
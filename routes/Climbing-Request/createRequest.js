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

const createRequestRouter = express.Router();

// Define the POST route for initial user preferences
createRequestRouter.post('/', authenticateToken, (req, res) => {
    console.log("createRequestRouter was hit")
    // Extract the user_id from the request
    const user_id = req.user_id;
    const { timestamp, expiration_date, area, region, areaChecked, selectedRoutes, timeData, climbingStyle, material, neededMaterial, message } = req.body;
    // SQL query to insert the user preferences into the database
    const sql = `
  INSERT INTO requests_info 
  (user_id, timestamp, expiration_date, area, region, area_checked, selected_routes, time_data, climbing_style, material, needed_material, message) 
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
    // Execute the SQL query
    pgPool.query(sql, values, (err, data) => {
        // Handle any errors during the query
        if (err) {
            console.error(err);
            return res.status(500).json("Error saving user preferences");
        }

        // If the query is successful, return a success response
        return res.json("User preferences saved successfully");
    });
});


// Export the router
export default createRequestRouter;
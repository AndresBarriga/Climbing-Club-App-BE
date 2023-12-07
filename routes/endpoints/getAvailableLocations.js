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

const getAvailableLocations = express.Router();

// Define the GET route for showing user profile
getAvailableLocations.get('/countries', (req, res) => {
  const sql = `SELECT name FROM countries`;

  pgPool.query(sql, (errUser, countries) => {
    if (errUser) {
      console.error(errUser);
      return res.status(500).json("Error fetching user details");
    }
      console.log({  preferences: countries.rows });
      // Send the fetched data back to the client
      res.json({ preferences: countries.rows });
    });
  });

  getAvailableLocations.get('/countries/regions', (req, res) => {
    const country = req.query.country; // Get the country value from the query parameters
    const sql = `
    SELECT name 
    FROM regions
    WHERE country = \$1
    `;
   
    pgPool.query(sql, [country], (errUser, regions) => {
    if (errUser) {
      console.error(errUser);
      return res.status(500).json("Error fetching user details");
    }
    console.log({ preferences: regions.rows });
    // Send the fetched data back to the client
    res.json({ preferences: regions.rows });
    });
   });

   getAvailableLocations.get('/countries/regions/area', (req, res) => {
    const region = req.query.region; // Get the country value from the query parameters
    const sql = `
    SELECT name 
    FROM areas
    WHERE regions = \$1
    `;

    pgPool.query(sql, [region], (errUser, areas) => {
    if (errUser) {
      console.error(errUser);
      return res.status(500).json("Error fetching user details");
    }
    console.log({ preferences: areas.rows });
    // Send the fetched data back to the client
    res.json({ preferences: areas.rows });
    });
   });

   getAvailableLocations.get('/countries/regions/area/route', (req, res) => {
    const area = req.query.area; // Get the area value from the query parameters
    console.log(area)

    const sql = `
    SELECT name, route_style 
    FROM routes
    WHERE area = \$1
    `;
   
    pgPool.query(sql, [area], (errUser, routes) => {
    if (errUser) {
      console.error(errUser);
      return res.status(500).json("Error fetching user details");
    }
    console.log({ preferences: routes.rows });
    // Send the fetched data back to the client
    res.json({ preferences: routes.rows });
    });
   });





export default getAvailableLocations;
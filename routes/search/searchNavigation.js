
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

const searchNavigationRouter = express.Router();

searchNavigationRouter.get('/route-details/:route', (req, res) => {
    const route = decodeURIComponent(req.params.route);
    console.log("route", route)
    // SQL query to get the route, area, region, and country details
    const getRouteDetailsQuery = `
      SELECT routes.name AS route, areas.name AS area, regions.name AS region, countries.name AS country 
      FROM routes 
      INNER JOIN areas ON routes.area = areas.name
      INNER JOIN regions ON areas.regions = regions.name
      INNER JOIN countries ON regions.country = countries.name
      WHERE routes.name ILIKE $1
    `;
  
    pgPool.query(getRouteDetailsQuery, [route], (getErr, getRes) => {
      if (getErr) {
        console.error(getErr);
        res.status(500).json({ error: 'Database error' });
      } else if (getRes.rows.length === 0) {
        res.status(404).json({ error: 'No route found' });
      } else {
        res.json(getRes.rows[0]);
      }
    });
  });

  // Fetch country and region for a given area
  searchNavigationRouter.get('/area-details/:area', (req, res) => {
  
  const { area } = req.params;
  const sqlQuery = `
    SELECT regions.name AS region, countries.name AS country 
    FROM areas 
    INNER JOIN regions ON areas.region = regions.name
    INNER JOIN countries ON regions.country = countries.name
    WHERE areas.name ILIKE $1
  `;

  pgPool.query(sqlQuery, [area], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json("Error fetching area details");
    }
    res.json(data.rows[0]);
  });
});

// Fetch country for a given region
searchNavigationRouter.get('/region-details/:region', (req, res) => {
  
  const { region } = req.params;
  const sqlQuery = `
    SELECT countries.name AS country 
    FROM regions 
    INNER JOIN countries ON regions.country = countries.name
    WHERE regions.name ILIKE $1
  `;

  pgPool.query(sqlQuery, [region], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json("Error fetching region details");
    }
    res.json(data.rows[0]);
  });
});


export default searchNavigationRouter;

import express from 'express';
import Pool from 'pg-pool';
import dotenv from 'dotenv';

dotenv.config();

// Set up PostgreSQL connection
const isProduction = process.env.NODE_ENV === 'production';
const pgPool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : 'postgres://postgres:5813@localhost:5432/climbing',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

const locationsRouter = express.Router();

// Define the GET route for showing user profile
locationsRouter.get('/',  (req, res) => {

  // SQL query to get the user details from the database
  const sqlQuery = `SELECT * FROM countries`;

  pgPool.query(sqlQuery, (errUser, dataCountries) => {
    if (errUser) {
      console.error(errUser);
      return res.status(500).json("Error fetching user details");
    }
      
    // Send the fetched data back to the client
    res.json([dataCountries.rows]);
  });
  });

locationsRouter.get('/:country', (req, res) => {
  const countryName = req.params.country;
  const sqlQuery = `SELECT * FROM regions WHERE country = \$1`;

  pgPool.query(sqlQuery, [countryName], (err, dataRegions) => {
    if (err) {
      console.error(err);
      return res.status(500).json("Error fetching regions");
    }
      
    res.json(dataRegions.rows);
  });
});

locationsRouter.get('/:country/:region', (req, res) => {
    const countryName = req.params.country;
    const regionName = req.params.region;
    
    const sqlQuery = `SELECT * FROM areas WHERE regions = \$1`;
  
    pgPool.query(sqlQuery, [regionName], (err, dataAreas) => {
      if (err) {
        console.error(err);
        return res.status(500).json("Error fetching regions");
      }
        
      res.json(dataAreas.rows);
    });
  });

  locationsRouter.get('/:country/:region/:area', (req, res) => {
   
    const areaName= req.params.area
    console.log("areaName", areaName)
    const sqlQuery = `SELECT * FROM routes WHERE area = \$1`;

    console.log("SQL QUERY", sqlQuery)
    pgPool.query(sqlQuery, [areaName], (err, dataRoutes) => {
      if (err) {
        console.error(err);
        return res.status(500).json("Error fetching regions");
      }        
      res.json(dataRoutes.rows);
    });
  });

  locationsRouter.get('/:country/:region/:area/:routeName', (req, res) => {
   console.log("Route was hitttt")
    const routeName= req.params.routeName
    
    const sqlQuery = `SELECT * FROM routes WHERE name = \$1`;
    pgPool.query(sqlQuery, [routeName], (err, dataRoutes) => {
      if (err) {
        console.error(err);
        return res.status(500).json("Error fetching regions");
      }        
      res.json(dataRoutes.rows[0]);
    });
  });

  locationsRouter.get('/area-details/:area',  (req, res) => {
    const { area } = req.params;
  
    // SQL query to get the region and country based on area
    const getAreaDetailsQuery = `
      SELECT region, country FROM areas 
      WHERE name ILIKE $1
    `;
  
    pgPool.query(getAreaDetailsQuery, [area], (getErr, getRes) => {
      if (getErr) {
        console.error(getErr);
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json(getRes.rows[0]);
      }
    });
  });


export default locationsRouter;
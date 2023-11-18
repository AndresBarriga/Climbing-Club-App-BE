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

const locationsRouter = express.Router();

// Define the GET route for showing user profile
locationsRouter.get('/',  (req, res) => {

  console.log("locations  route was hit")
  // Extract the user_id from the request


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
    
    const sqlQuery = `SELECT * FROM routes WHERE area = \$1`;
    pgPool.query(sqlQuery, [areaName], (err, dataRoutes) => {
      if (err) {
        console.error(err);
        return res.status(500).json("Error fetching regions");
      }        
      res.json(dataRoutes.rows);
    });
  });



export default locationsRouter;
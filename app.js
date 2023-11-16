import express from 'express';
import cors from 'cors';
import Pool from 'pg-pool';
import loginRouter from './routes/Auth-Routes/LogInRoute.js'
import registrationRoute from './routes/Auth-Routes/RegisterRoute.js';
import initialUserPreferencesRouter from './routes/profileRoutes/initialUserPreferencesRouter.js';
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken"
import showProfileRouter from './routes/profileRoutes/showProfileUser.js';
import logoutRouter from './routes/Auth-Routes/LogOutRoute.js';
import editUserProfileRouter from './routes/profileRoutes/editUserProfile.js'
import locationsRouter from './routes/Locations-routes/locationsRouter.js';



const app = express();
const port = process.env.PORT || 3001;

// Database connection
const pgPool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "climbing",
  password: "5813",
  port: 5432,
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests from Client - React app
  credentials: true, // Allow credentials (e.g., cookies)
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions)); 

//Routes definition
app.get('/', loginRouter, (req, res) => {
  res.send('Welcome to the Climbing Club App!');
});
app.use('/auth', loginRouter);
app.use('/registration', registrationRoute);
app.use('/initial-preferences', initialUserPreferencesRouter)
app.use('/edit-profile', editUserProfileRouter)
app.use('/show-profile', showProfileRouter )
app.use('/climbing-locations', locationsRouter )
app.use('/logout',logoutRouter)



// Middleware to authenticate the user for the "Private" route
const privateRouteMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("pivate Route Middelware was hit")
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    console.log(token)

    jwt.verify(token, 'your-secret-key', (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      console.log(user)
      next();
    });
  } else {
    res.sendStatus(401);
  }
};


app.get('/check-auth', privateRouteMiddleware, (req, res) => {
  // If the user is authenticated, send a success status code
  res.sendStatus(200);
});

app.post('/initial-preferences', privateRouteMiddleware, (req, res) => {
  // If the user is authenticated, send a success status code
  res.sendStatus(200);
});
app.post('/initial-preferences/profile-picture', privateRouteMiddleware, (req, res) => {
  // If the user is authenticated, send a success status code
  res.sendStatus(200);
});
app.put('/edit-profile', privateRouteMiddleware, (req, res) => {
  // If the user is authenticated, send a success status code
  res.sendStatus(200);
});
app.put('/edit-profile/profile-picture', privateRouteMiddleware, (req, res) => {
  // If the user is authenticated, send a success status code
  res.sendStatus(200);
});
app.get('/dashboard', privateRouteMiddleware, (req, res) => {
  // If the user is authenticated, send a success status code
  res.sendStatus(200);
});
app.get('/show-profile', privateRouteMiddleware, (req, res) => {
  // If the user is authenticated, send a success status code
  res.sendStatus(200);
});

app.get('/api/isAuthenticated', privateRouteMiddleware, (req, res) => {
  // If the user is authenticated, send a success status code and a JSON response
  res.json({ isAuthenticated: true });
  res.sendStatus(200)
});

app.get('/logout', (req, res) => {
  console.log("Route was hit")
  console.log(req.user)
  req.user = null;
  res.sendStatus(200);
});

process.on('exit', () => {
  pgPool.end();
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

